import SnowflakeId from 'snowflake-id';

const snowflake = new SnowflakeId({
  mid: 1,
  offset: (2020 - 1970) * 31536000 * 1000,
});

export function generateId(): string {
  return snowflake.generate();
}
