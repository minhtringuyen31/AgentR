interface ListResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export { ListResponse };
