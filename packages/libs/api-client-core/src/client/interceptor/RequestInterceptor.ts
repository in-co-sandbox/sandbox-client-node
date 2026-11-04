import type { InternalAxiosRequestConfig } from 'axios';

/** A function that adjusts each outgoing request, such as adding headers. */
export type RequestInterceptor = (
    config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
