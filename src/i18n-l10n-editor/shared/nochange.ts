import { empty } from './constants';

export const nochange = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/u, empty)
    .split(/[^a-zA-Z0-9@\.]/u)
    .map((element) =>
      element
    )
    .join(empty);
