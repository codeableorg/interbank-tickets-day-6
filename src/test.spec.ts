function suma(a: number, b: number): number {
  return a + b;
}

describe('Función Suma', () => {
  it('suma los argumentos recibidos correctamente', () => {
    const actual = suma(2, 2);
    const expetected = 4;

    expect(actual).toEqual(expetected);
  });
});
