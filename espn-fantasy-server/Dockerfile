FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src /app

EXPOSE 8080

CMD ["uvicorn", "server:app", "--host", "localhost", "--port", "8080"]

# Build command: docker build -t fbball-server .
# Run command: docker run -p 8080:8080 fbball-server