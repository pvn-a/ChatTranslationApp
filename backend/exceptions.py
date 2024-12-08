class MyHTTPException(Exception):
    def __init__(self, status_code: int, error: str):
        self.status_code = status_code
        self.error = error
