# Quote Cart Freight UseCase

## Objetivo
O `QuoteCartFreightUseCase` é o caso de uso responsável por calcular (cotar) o valor do frete para os itens de um carrinho de compras, utilizando o provedor de entregas configurado (por exemplo, TaxiMachine) e estabelecendo o endereço de entrega do cliente.

## Passo a Passo (Fluxo de Execução)

1. **Validação do Carrinho**:
   O fluxo inicia buscando o carrinho no banco de dados através do seu `cart_uuid`. Se o carrinho não existir, um erro `404` é lançado.

2. **Resgate do Endereço de Origem (Despacho)**:
   O sistema identifica a qual parceiro o carrinho pertence através da propriedade `business_info_uuid` e busca suas configurações (PartnerConfig). Ele garante que o parceiro possui um endereço de despacho devidamente configurado, juntamente com suas coordenadas geográficas (latitude e longitude). Sem um endereço de origem, a cotação não pode ser realizada.

3. **Definição das Coordenadas de Destino (Geocoding)**:
   O caso de uso verifica se o GPS do destino (`destination_lat` e `destination_lng`) foi enviado na requisição (geralmente pelo front-end). Caso não tenha sido enviado, o sistema realiza uma operação de _Geocoding_ a partir do CEP, rua e número informados para encontrar as coordenadas exatas do cliente.

4. **Criação da Entidade de Endereço**:
   Uma entidade de domínio (`AddressEntity`) de destino é instanciada contendo todas as informações formatadas (logradouro, número, complemento, bairro, cidade, CEP, estado, latitude e longitude).

5. **Cotação no Provedor de Entrega**:
   Um _payload_ rigoroso é montado, cruzando o endereço de origem (do lojista) e o de destino (da `AddressEntity`). Este payload é então repassado ao provedor de entregas parceiro (`this.deliveryProvider.quoteDelivery`), que responde com o preço e a estimativa de tempo da viagem.

6. **Persistência Simultânea**:
   Com o preço do frete obtido, o caso de uso chama o repositório do carrinho (`cartRepository.updateFreight`). Ele salva não apenas as informações de frete (custo e prazo no carrinho), mas também repassa a `AddressEntity` criada para que o repositório lide com a persistência do registro deste novo endereço no banco de dados, atrelando-o ao carrinho através de uma ForeignKey (`destination_address_uuid`).

7. **Devolução do Resultado**:
   Retorna ao controlador os detalhes do frete calculado (`freight_amount`), sua estimativa em minutos (`estimated_minutes`) e o tempo de expiração daquela cotação (`expires_at`), para que o _front-end_ possa exibir as opções ao consumidor antes do fechamento.

## Dependências Injetadas

- **ICartRepository**: Usado para buscar o carrinho e atualizar os dados do frete (além de criar o endereço de destino simultaneamente).
- **IPartnerConfigRepository**: Usado para resgatar as configurações do restaurante/loja e extrair de onde os pedidos serão despachados (origem do frete).
- **IDeliveryProvider**: O provedor externo (ex: TaxiMachine) responsável pela lógica real de precificação com base em distância, peso ou tempo do percurso.
