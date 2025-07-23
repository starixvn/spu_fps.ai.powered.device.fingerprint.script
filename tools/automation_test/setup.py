from setuptools import setup, find_packages
import os

def read_readme():
    readme_path = os.path.join(os.path.dirname(__file__), 'README.md')
    if os.path.exists(readme_path):
        with open(readme_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "Browser fingerprint testing suite for automated cross-browser testing and attribute collection."

def read_requirements():
    requirements_path = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    if os.path.exists(requirements_path):
        with open(requirements_path, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f if line.strip() and not line.startswith('#')]
    return []

setup(
    name="fps-ai-device-fingerprint",
    version="1.9.0",
    author="",
    author_email="",
    description="AI-powered device fingerprint testing suite for browser automation",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://gitlab.nexdev.net/spu/fps.ai.powered.device.fingerprint",
    project_urls={
        "Bug Tracker": "https://gitlab.nexdev.net/spu/fps.ai.powered.device.fingerprint/-/issues",
        "Source Code": "https://gitlab.nexdev.net/spu/fps.ai.powered.device.fingerprint",
    },
    
    package_dir={"": "src"},
    py_modules=["app"],
    packages=["fps_test", "config", "utils"],
    
    include_package_data=True,
    package_data={
        "fps_test": ["*.py"],
        "config": ["*.py"],
        "utils": ["*.py"],
    },
    
    install_requires=read_requirements(),
    
    extras_require={
        "dev": [
            "black>=23.0.0",
            "flake8>=6.0.0",
            "isort>=5.12.0",
            "mypy>=1.5.0",
            "pre-commit>=3.0.0",
        ],
        "test": [
            "pytest>=7.4.0",
            "pytest-html>=4.1.0",
            "pytest-cov>=4.1.0",
            "pytest-xvfb>=3.0.0",  
        ],
        "build": [
            "pyinstaller>=6.3.0",
        ],
    },
    
    python_requires=">=3.8",
    
    entry_points={
        "console_scripts": [
            "fps-fingerprint=app:main",
        ],
    },
    
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Testing",
        "Topic :: Internet :: WWW/HTTP :: Browsers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
        "Environment :: Console",
        "Framework :: Pytest",
    ],
    
    # Keywords for PyPI search
    keywords=[
        "browser",
        "fingerprint",
        "testing",
        "automation",
        "selenium",
        "cross-browser",
        "device-detection",
        "web-testing",
        "ai-powered",
    ],
    
    # Metadata
    license="MIT",
    platforms=["any"],
    zip_safe=False,
)
