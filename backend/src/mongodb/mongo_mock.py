# mocks mongo locally for testing


class TableMock:
    def __init__(self):
        self.storage = []
        self._id_counter = 1

    def insert_one(self, document):
        doc = document.copy()
        if "_id" not in doc:
            doc["_id"] = self._id_counter
            self._id_counter += 1
        self.storage.append(doc)

        class Result:
            def __init__(self, id):
                self.inserted_id = id

        return Result(doc["_id"])

    def insert_many(self, documents):
        ids = []
        for doc in documents:
            result = self.insert_one(doc)
            ids.append(result.inserted_id)

        class Result:
            def __init__(self, ids):
                self.inserted_ids = ids

        return Result(ids)

    def find_one(self, filter_dict=None):
        if not filter_dict:
            return self.storage[0].copy() if self.storage else None

        for doc in self.storage:
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                return doc.copy()
        return None

    def find(self, filter_dict=None, projection=None):
        results = []

        for doc in self.storage:
            if filter_dict is None or all(
                doc.get(k) == v for k, v in filter_dict.items()
            ):
                if projection and projection.get("_id") == 0:
                    doc_copy = {k: v for k, v in doc.items() if k != "_id"}
                else:
                    doc_copy = doc.copy()
                results.append(doc_copy)

        return MockCursor(results)

    def update_one(self, filter_dict, update_dict, upsert=False):
        for doc in self.storage:
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                if "$set" in update_dict:
                    doc.update(update_dict["$set"])
                elif "$inc" in update_dict:
                    for field, inc_value in update_dict["$inc"].items():
                        doc[field] = doc.get(field, 0) + inc_value
                else:
                    doc.update(update_dict)

                class Result:
                    modified_count = 1
                    upserted_id = None

                return Result()

        if upsert:
            new_doc = filter_dict.copy()
            if "$set" in update_dict:
                new_doc.update(update_dict["$set"])
            else:
                new_doc.update(update_dict)
            result = self.insert_one(new_doc)

            class Result:
                modified_count = 0
                upserted_id = result.inserted_id

            return Result()

        class Result:
            modified_count = 0
            upserted_id = None

        return Result()

    def update_many(self, filter_dict, update_dict):
        count = 0
        for doc in self.storage:
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                if "$set" in update_dict:
                    doc.update(update_dict["$set"])
                else:
                    doc.update(update_dict)
                count += 1

        class Result:
            modified_count = count

        return Result()

    def delete_one(self, filter_dict):
        for i, doc in enumerate(self.storage):
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                self.storage.pop(i)

                class Result:
                    deleted_count = 1

                return Result()

        class Result:
            deleted_count = 0

        return Result()

    def delete_many(self, filter_dict):
        if not filter_dict:
            count = len(self.storage)
            self.storage = []
        else:
            to_delete = []
            for i, doc in enumerate(self.storage):
                if all(doc.get(k) == v for k, v in filter_dict.items()):
                    to_delete.append(i)

            for i in reversed(to_delete):
                self.storage.pop(i)
            count = len(to_delete)

        class Result:
            deleted_count = count

        return Result()

    def count_documents(self, filter_dict=None):
        if not filter_dict:
            return len(self.storage)

        count = 0
        for doc in self.storage:
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                count += 1
        return count

    def distinct(self, field):
        values = set()
        for doc in self.storage:
            if field in doc:
                values.add(doc[field])
        return list(values)

    def create_index(self, field, unique=False):
        pass


class MockCursor:
    def __init__(self, results):
        self.results = results
        self._skip = 0
        self._limit = None
        self._sort_key = None
        self._sort_order = 1

    def sort(self, field, order=-1):
        self._sort_key = field
        self._sort_order = order
        return self

    def skip(self, n):
        self._skip = n
        return self

    def limit(self, n):
        self._limit = n
        return self

    def __iter__(self):
        if self._sort_key:
            reverse = self._sort_order == -1
            sorted_results = sorted(
                self.results, key=lambda x: x.get(self._sort_key, 0), reverse=reverse
            )
        else:
            sorted_results = self.results

        start = self._skip
        end = start + self._limit if self._limit else None

        return iter(sorted_results[start:end])

    def __getitem__(self, index):
        return list(self)[index]
