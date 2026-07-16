export type PublicationRequestToken = {
  readonly identity: string;
  readonly sequence: number;
};

export function createPublicationIdentity(tenantId: string, themeId: string): string {
  return `${tenantId.length}:${tenantId}${themeId}`;
}

export class PublicationRequestTracker {
  #identity: string;
  #sequence = 0;

  constructor(identity: string) {
    this.#identity = identity;
  }

  updateIdentity(identity: string): void {
    if (identity !== this.#identity) {
      this.#identity = identity;
      this.#sequence += 1;
    }
  }

  isIdentityCurrent(identity: string): boolean {
    return identity === this.#identity;
  }

  beginRequest(): PublicationRequestToken {
    this.#sequence += 1;

    return {
      identity: this.#identity,
      sequence: this.#sequence,
    };
  }

  isRequestCurrent(token: PublicationRequestToken): boolean {
    return token.identity === this.#identity && token.sequence === this.#sequence;
  }

  invalidateRequest(token: PublicationRequestToken): void {
    if (this.isRequestCurrent(token)) {
      this.#sequence += 1;
    }
  }
}
