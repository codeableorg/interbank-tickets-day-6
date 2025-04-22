function suma(a: number, b: number): number {
  return a + b;
}

describe('Función Suma', () => {
  it('suma los argumentos recibidos correctamente', () => {
    // Comparar un valor esperado vs un valor obtenido
    const expetected = 4;
    const actual = suma(2, 2);

    expect(actual).toEqual(expetected);
  });

  it('omite argumentos extra', () => {
    // Comparar un valor esperado vs un valor obtenido
    const expetected = 4;
    const actual = suma(2, 2, 1, 2, 3, 4);

    expect(actual).toEqual(expetected);
  });
});
