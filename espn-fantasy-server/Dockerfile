FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src /app

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "127.0.0.1", "--port", "8000"]

# Build command: docker build -t fbball-server .
# Run command: docker run -p 8000:8000 fbball-server