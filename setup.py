from setuptools import setup, find_packages

setup(
    name="termiart",
    version="2.0.0",
    description="Turn any image into living terminal art",
    author="TermiArt",
    py_modules=["termiart"],
    packages=find_packages(include=["core*", "cli*", "colors*", "renderers*", "effects*"]),
    entry_points={
        "console_scripts": [
            "termiart = termiart:main",
        ],
    },
    install_requires=[
        "Pillow>=9.0.0",
    ],
    python_requires=">=3.9",
)
