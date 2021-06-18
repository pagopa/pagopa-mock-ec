/* tslint:disable: no-any */

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

it('should return TRUE ', async () => {
  expect(true).toBe(true);
});
