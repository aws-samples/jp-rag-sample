FROM python:3.10

WORKDIR /app
COPY ./app /app
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80", "--workers", "4"]