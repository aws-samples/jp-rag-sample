FROM python:3.10

EXPOSE 8080

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN python -m pip install -r requirements.txt
COPY ./app /app

# Creates a non-root user and adds permission to access the /app folder
RUN useradd appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4"]
HEALTHCHECK CMD curl -s -S -o /dev/null http://localhost:8080/docs || exit 1
