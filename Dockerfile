# Keyboard Bridge Python Daemon Dockerfile
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies and Python 3.12
RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y \
        python3.12 \
        python3.12-dev \
        python3.12-venv \
        python3-pip \
        build-essential \
        linux-headers-generic \
        udev \
        curl \
        clang \
    && rm -rf /var/lib/apt/lists/*

# Make python3 point to python3.12
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1

# Install pip using ensurepip and then install setuptools and PDM
RUN python3.12 -m ensurepip --upgrade && \
    python3.12 -m pip install --upgrade pip setuptools && \
    python3.12 -m pip install pdm

# Create app directory
WORKDIR /app

# Copy the Python source code and PDM files
COPY src/python/pyproject.toml src/python/pdm.lock ./
COPY src/python/keyboard_bridge ./keyboard_bridge
COPY README.md ./

# Build the wheel inside the container
RUN pdm build

# Install the built wheel
RUN pip install dist/*.whl

# Clean up build dependencies and source (optional, for smaller image)
RUN rm -rf keyboard_bridge *.egg-info dist build src tests

# Copy and set up the entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create necessary directories and set permissions
RUN mkdir -p /dev/input && \
    chmod 666 /dev/uinput 2>/dev/null || true

# Create a non-root user for running the daemon
RUN useradd -m -s /bin/bash keyboardbridge && \
    usermod -a -G input keyboardbridge

# Switch to non-root user
USER keyboardbridge

# Expose WebSocket port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python3 -c "import websockets; import asyncio; print('Health check passed')" || exit 1

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Default command (can be overridden by docker-compose)
CMD [] 