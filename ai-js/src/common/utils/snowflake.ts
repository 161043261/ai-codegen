/**
 * Snowflake ID generator
 */
export class Snowflake {
  private static readonly EPOCH = 1640995200000n; // 2022-01-01 00:00:00 UTC
  private static readonly WORKER_ID_BITS = 5n;
  private static readonly DATACENTER_ID_BITS = 5n;
  private static readonly SEQUENCE_BITS = 12n;

  private static readonly MAX_WORKER_ID = -1n ^ (-1n << this.WORKER_ID_BITS);
  private static readonly MAX_DATACENTER_ID =
    -1n ^ (-1n << this.DATACENTER_ID_BITS);
  private static readonly MAX_SEQUENCE = -1n ^ (-1n << this.SEQUENCE_BITS);

  private static readonly WORKER_ID_SHIFT = this.SEQUENCE_BITS;
  private static readonly DATACENTER_ID_SHIFT =
    this.SEQUENCE_BITS + this.WORKER_ID_BITS;
  private static readonly TIMESTAMP_SHIFT =
    this.SEQUENCE_BITS + this.WORKER_ID_BITS + this.DATACENTER_ID_BITS;

  private workerId: bigint;
  private datacenterId: bigint;
  private sequence: bigint = 0n;
  private lastTimestamp: bigint = -1n;

  constructor(workerId: number = 1, datacenterId: number = 1) {
    const workerIdBigInt = BigInt(workerId);
    const datacenterIdBigInt = BigInt(datacenterId);

    if (workerIdBigInt > Snowflake.MAX_WORKER_ID || workerIdBigInt < 0n) {
      throw new Error(
        `Worker ID must be between 0 and ${Snowflake.MAX_WORKER_ID}`,
      );
    }
    if (
      datacenterIdBigInt > Snowflake.MAX_DATACENTER_ID ||
      datacenterIdBigInt < 0n
    ) {
      throw new Error(
        `Datacenter ID must be between 0 and ${Snowflake.MAX_DATACENTER_ID}`,
      );
    }

    this.workerId = workerIdBigInt;
    this.datacenterId = datacenterIdBigInt;
  }

  nextId(): string {
    let timestamp = this.currentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error("Clock moved backwards. Refusing to generate id.");
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & Snowflake.MAX_SEQUENCE;
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - Snowflake.EPOCH) << Snowflake.TIMESTAMP_SHIFT) |
      (this.datacenterId << Snowflake.DATACENTER_ID_SHIFT) |
      (this.workerId << Snowflake.WORKER_ID_SHIFT) |
      this.sequence;

    return id.toString();
  }

  private currentTimestamp(): bigint {
    return BigInt(Date.now());
  }

  private waitNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.currentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp();
    }
    return timestamp;
  }
}

export const snowflake = new Snowflake();
