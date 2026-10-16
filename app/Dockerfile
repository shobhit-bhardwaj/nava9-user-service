FROM python:3.12.15-slim-trixie

LABEL authors="shobhit"

WORKDIR /app

COPY requirements.txt .
COPY . .

RUN pip install --no-cache-dir -r requirements.txt

RUN adduser --disabled-password --no-create-home appuser \
    && mkdir -p /app/logs \
    && chown appuser:appuser /app/logs
USER appuser

EXPOSE 5000
CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "5000"]