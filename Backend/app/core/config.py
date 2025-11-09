import logging
import os
import time

from pydantic_settings import BaseSettings, SettingsConfigDict

# Set timezone to America/Sao_Paulo to avoid timezone issues
os.environ["TZ"] = "America/Sao_Paulo"
time.tzset()

class EnvSettings(BaseSettings):
    DEBUG: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

ENV = EnvSettings()

logging.basicConfig(
    level=logging.DEBUG if ENV.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s %(name)s - %(funcName)s() ] %(message)s"
)