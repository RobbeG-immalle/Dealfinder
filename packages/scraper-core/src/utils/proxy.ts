export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export class ProxyRotator {
  private proxies: ProxyConfig[];
  private currentIndex = 0;

  constructor(proxies: ProxyConfig[] = []) {
    this.proxies = proxies;
  }

  getNext(): ProxyConfig | undefined {
    if (this.proxies.length === 0) return undefined;
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }

  toPlaywrightProxy(config: ProxyConfig): {
    server: string;
    username?: string;
    password?: string;
  } {
    return {
      server: `http://${config.host}:${config.port}`,
      username: config.username,
      password: config.password,
    };
  }

  hasProxies(): boolean {
    return this.proxies.length > 0;
  }
}
