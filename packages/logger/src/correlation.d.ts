export declare function generateCorrelationId(): string;
export declare function extractCorrelationId(
  headers: Record<string, string | string[] | undefined>,
  headerName?: string,
): string | null;
export declare function getOrGenerateCorrelationId(
  headers: Record<string, string | string[] | undefined>,
  headerName?: string,
): string;
export declare function correlationIdMiddleware(
  headerName?: string,
): (req: any, res: any, next: any) => void;
//# sourceMappingURL=correlation.d.ts.map
