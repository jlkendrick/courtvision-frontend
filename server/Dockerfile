FROM python:3.12-slim

WORKDIR /fbball/server/src

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src /fbball/server/src

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "80", "--reload"]