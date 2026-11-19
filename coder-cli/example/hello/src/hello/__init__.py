from collections.abc import Iterable


def average(values: Iterable[float]) -> float:
    """Return the arithmetic mean of ``values``.

    Raises:
        ValueError: if ``values`` is empty.
    """
    values = list(values)
    if not values:
        raise ValueError("average() requires at least one value")
    return sum(values) / len(values)


def main() -> None:
    print("Hello from hello!")
