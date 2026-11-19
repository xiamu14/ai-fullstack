def average(numbers):
    """返回一组数的平均值；空序列抛出 ValueError。"""
    if not numbers:
        raise ValueError("不能对空序列求平均值")
    return sum(numbers) / len(numbers)


def variance(numbers):
    """返回一组数的总体方差（除以 n）；空序列抛出 ValueError。"""
    if not numbers:
        raise ValueError("不能对空序列求方差")
    avg = average(numbers)
    return sum((x - avg) ** 2 for x in numbers) / len(numbers)
