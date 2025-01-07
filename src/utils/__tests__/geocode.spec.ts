// geocoder.test.js

const NodeGeocoder = require('node-geocoder');
const { geocodeAddress } = require('../geocoder');

jest.mock('node-geocoder', () => {
  return jest.fn().mockImplementation(() => {
    return {
      geocode: jest.fn().mockResolvedValue([
        {
          latitude: -23.550520,
          longitude: -46.633308,
          formattedAddress: 'São Paulo, Brazil',
        },
      ]),
    };
  });
});

describe('geocodeAddress', () => {
  it('deve retornar a latitude e longitude esperadas para um endereço válido', async () => {
    const result = await geocodeAddress('771', 'Rua Pitangui', '79103151');

    expect(result).toEqual({
      lat: -23.550520,
      long: -46.633308,
    });
  });


});
