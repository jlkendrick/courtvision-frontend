FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src /app

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "81", "--reload"]

# Build command: docker build -t fbball-server .
# Run command: docker run -p 81:81 fbball-server