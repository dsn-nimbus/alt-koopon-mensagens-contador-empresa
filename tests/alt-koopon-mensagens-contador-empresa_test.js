'use strict';

describe('Service: AltKooponMensagemContadorEmpresa', function () {
  var _rootScope, _scope, _q, _compile, _httpBackend, _AltKooponMensagemService, _AltKooponMensagemModel,
  _AltPassaporteUsuarioLogadoManager, _AltModalService, _AltKooponNotificacoesManager,
  _$xtorage,
  _ALT_KOOPON_URL_BASE_API_MENSAGEM;

  var modeloMensagemCompleto;
  var ID_MODAL_MENSAGEM;
  var EVENTO_NOVO_ASSUNTO;
  var CHAVE_CLIENTE_ESCOLHIDO;
  var NOME_CONTROLLER_NOVA_MENSAGEM = 'AltKooponNovaMensagemController as nmCtrl';

  beforeEach(module('alt.koopon.mensagens-contador-empresa'));

  beforeEach(inject(function($injector) {
    _rootScope = $injector.get('$rootScope');
    _scope = _rootScope.$new();_q = $injector.get('$q');
    _compile = $injector.get('$compile');
    _httpBackend = $injector.get('$httpBackend');
    _$xtorage = $injector.get('$xtorage');
    ID_MODAL_MENSAGEM = $injector.get('ID_MODAL_MENSAGEM');
    EVENTO_NOVO_ASSUNTO = $injector.get('EVENTO_NOVO_ASSUNTO');
    CHAVE_CLIENTE_ESCOLHIDO = $injector.get('CHAVE_CLIENTE_ESCOLHIDO');
    _AltKooponMensagemService = $injector.get('AltKooponMensagemService');
    _AltKooponMensagemModel = $injector.get('AltKooponMensagemModel');
    _AltModalService = $injector.get('AltModalService');
    _AltPassaporteUsuarioLogadoManager = $injector.get('AltPassaporteUsuarioLogadoManager');
    _AltKooponNotificacoesManager = $injector.get('AltKooponNotificacoesManager');
    _ALT_KOOPON_URL_BASE_API_MENSAGEM = $injector.get('ALT_KOOPON_URL_BASE_API_MENSAGEM');

    modeloMensagemCompleto = {
      assunto: 'abc',
      texto: '123',
      nomeUsuarioPassaporte: 'abc123',
      anexo: 'abc.jpg',
      data: '11/12/2013'
    }

    spyOn(_AltModalService, 'open').and.callFake(angular.noop);
    spyOn(_AltModalService, 'close').and.callFake(angular.noop);

    spyOn(_AltKooponNotificacoesManager, 'atualiza').and.callFake(angular.noop);
  }));

  describe('constantes', function() {
    it('deve ter o valor correto para ID_MODAL_MENSAGEM', function() {
      expect(ID_MODAL_MENSAGEM).toEqual('#modal-nova-mensagem');
    })

    it('deve ter o valor correto para EVENTO_NOVO_ASSUNTO', function() {
      expect(EVENTO_NOVO_ASSUNTO).toEqual('mensagem:novo-assunto');
    })

    it('deve ter o valor correto para CHAVE_CLIENTE_ESCOLHIDO', function() {
      expect(CHAVE_CLIENTE_ESCOLHIDO).toEqual('cliente_escolhido');
    })
  })

  describe('url base', function() {
    it('deve ter a url base com o valor correto', function() {
      expect(_ALT_KOOPON_URL_BASE_API_MENSAGEM).toEqual('/koopon-rest-api/');
    })
  })

  describe('model', function() {
    describe('criação', function() {
      it('deve ter o retorno correto', function() {
        expect(typeof _AltKooponMensagemModel).toBe('function');
      });

      it('deve ter a instância com as propriedades/valores corretos - vazios', function() {
        var _akmm = new _AltKooponMensagemModel();

        expect(_akmm.assunto).toBeUndefined();
        expect(_akmm.texto).toBeUndefined();
        expect(_akmm.nomeUsuarioPassaporte).toBeUndefined();
        expect(_akmm.anexo).toBeUndefined();
        expect(_akmm.data).toBeUndefined();
      });

      it('deve ter a instância com as propriedades/valores corretos - preenchidos', function() {
        var _akmm = new _AltKooponMensagemModel(modeloMensagemCompleto);

        expect(_akmm.assunto).toEqual(modeloMensagemCompleto.assunto);
        expect(_akmm.texto).toEqual(modeloMensagemCompleto.texto);
        expect(_akmm.nomeUsuarioPassaporte).toEqual(modeloMensagemCompleto.nomeUsuarioPassaporte);
        expect(_akmm.anexo).toEqual(modeloMensagemCompleto.anexo);
        expect(_akmm.data).toEqual(modeloMensagemCompleto.data);
      });
    })

    describe('isValid', function() {
      it('deve retorna false, instância vazia', function() {
        var _akmm = new _AltKooponMensagemModel();

        expect(_akmm.isValid()).toBeFalsy();
      })

      it('deve retorna false, sem assunto', function() {
        var _akmm = new _AltKooponMensagemModel(modeloMensagemCompleto);

        delete _akmm.assunto;

        expect(_akmm.isValid()).toBeFalsy();
      })

      it('deve retorna false, sem mensagem', function() {
        var _akmm = new _AltKooponMensagemModel(modeloMensagemCompleto);

        delete _akmm.texto;

        expect(_akmm.isValid()).toBeFalsy();
      })

      it('deve retorna true', function() {
        var _akmm = new _AltKooponMensagemModel(modeloMensagemCompleto);

        expect(_akmm.isValid()).toBeTruthy();
      })
    });

    describe('respostaValida', function(){
      it('deve deve retornar false - resposta == undefined', function(){
        var _akmm = _AltKooponMensagemModel;
        var model = undefined;

        expect(_akmm.respostaValida(model)).toBe(false);
      })

      it('deve deve retornar false - resposta.texto == undefined', function(){
        var _akmm = _AltKooponMensagemModel;
        var model = new _AltKooponMensagemModel(modeloMensagemCompleto);

        model.texto = undefined;
        expect(_akmm.respostaValida(model)).toBe(false);
      })


      it('deve deve retornar false - resposta.texto.length == undefined || < 1', function(){
        var _akmm = _AltKooponMensagemModel;
        var model = new _AltKooponMensagemModel(modeloMensagemCompleto);

        model.texto = "";
        expect(_akmm.respostaValida(model)).toBe(false);
      })

      it('deve deve retornar true - resposta.texto.length != undefined && > 0', function(){
        var _akmm = _AltKooponMensagemModel;
        var model = new _AltKooponMensagemModel(modeloMensagemCompleto);

        model.texto = "Mensagem deve ser enviada.";
        expect(_akmm.respostaValida(model)).toBe(true);
      })
    });

    describe('msgDoUsuarioLogado', function() {
      it('deve retornar false, mensagem não é do usuário logado', function() {
        spyOn(_AltPassaporteUsuarioLogadoManager, 'retorna').and.returnValue({nomeUsuario: 'qqcoisa'});

        var _akmm = new _AltKooponMensagemModel();

        expect(_akmm.msgDoUsuarioLogado()).toBe(false);
      })

      it('deve retornar false, mensagem não é do usuário logado', function() {
        spyOn(_AltPassaporteUsuarioLogadoManager, 'retorna').and.returnValue({nomeUsuario: 'qqcoisa'});

        var _akmm = new _AltKooponMensagemModel();
        _akmm.nomeUsuarioPassaporte = 'qqcoisa';

        expect(_akmm.msgDoUsuarioLogado()).toBe(true);
      })
    });
  })

  describe('service', function() {
    var URL_BASE = '/koopon-rest-api/mensagens';

    describe('criação', function() {
      it('deve retornar o constructor', function() {
        expect(typeof _AltKooponMensagemService).toBe('object');
      })
    })

    describe('listarEmpresasAssuntos', function() {
      it('NÃO deve tentar listar os assuntos, array de empresas não informado', function() {
        var _urlAssuntos = URL_BASE;
        var _empresas = undefined;

        _AltKooponMensagemService
          .listarEmpresasAssuntos(_empresas)
          .then(function(){expect(true).toBe(false)})
          .catch(function(erro) {
            expect(erro).toBeDefined();
            expect(erro instanceof TypeError).toBeDefined();
            expect(erro.message).toEqual('Empresas deve ser um array.');
          });

        _rootScope.$digest();
      })

      it('NÃO deve tentar listar os assuntos, array de empresas não é um array', function() {
        var _urlAssuntos = URL_BASE;
        var _empresas = {};

        _AltKooponMensagemService
          .listarEmpresasAssuntos(_empresas)
          .then(function(){expect(true).toBe(false)})
          .catch(function(erro) {
            expect(erro).toBeDefined();
            expect(erro instanceof TypeError).toBeDefined();
            expect(erro.message).toEqual('Empresas deve ser um array.');
          });

        _rootScope.$digest();
      })

      it('deve tentar listar as empresas com os asssuntos, mas servidor retorna erro', function() {
        var _urlAssuntos = URL_BASE;
        var _empresas = [];

        _httpBackend.expectGET(_urlAssuntos).respond(400);

        _AltKooponMensagemService
        .listarEmpresasAssuntos(_empresas)
        .then(function(){expect(true).toBe(false)})
        .catch(function(erro) {
          expect(erro).toBeDefined();
        });

        _httpBackend.flush();
      })

      it('deve listar as empresas com os assuntos corretamente', function() {
        var _urlAssuntos = URL_BASE;
        var _resposta = {
          "1": [
            {assunto: "11"},
            {assunto: "12"},
            {assunto: "13"},
          ],
          "2": [
            {assunto: "21"},
            {assunto: "22"},
            {assunto: "23"},
          ],
          "3": [
            {assunto: "31"},
            {assunto: "32"},
            {assunto: "33"},
          ]
        };

        var _respostaParsed = [
          {
            id: "1",
            nome: "a_nome",
            assuntos: [
              {assunto: "11"},
              {assunto: "12"},
              {assunto: "13"}]
            },
            {
              id: "2",
              nome: "2_nome",
              assuntos: [
                {assunto: "21"},
                {assunto: "22"},
                {assunto: "23"}]
              },
              {
                id: "3",
                nome: "3_nome",
                assuntos: [
                  {assunto: "31"},
                  {assunto: "32"},
                  {assunto: "33"}]
                }
              ];

              var _empresas = [
                  {idAssinante: 1, nome: '1_nome'},
                  {idAssinante: 2, nome: '2_nome'},
                  {idAssinante: 3, nome: '3_nome'}
              ]

              _httpBackend.expectGET(_urlAssuntos).respond(200, _resposta);

              _AltKooponMensagemService
              .listarEmpresasAssuntos(_empresas)
              .then(function(empresas) {
                expect(empresas[0].id).toBe('1');
                expect(empresas[0].nome).toBe('1_nome');
                expect(empresas[0].assuntos).toEqual(_respostaParsed[0].assuntos);

                expect(empresas[1].id).toBe('2');
                expect(empresas[1].nome).toBe('2_nome');
                expect(empresas[1].assuntos).toEqual(_respostaParsed[1].assuntos);

                expect(empresas[2].id).toBe('3');
                expect(empresas[2].nome).toBe('3_nome');
                expect(empresas[2].assuntos).toEqual(_respostaParsed[2].assuntos);
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();
            })
          })

          describe('listarAssuntos', function() {
            it('deve tentar listar assuntos, mas servidor retorna erro', function() {
              var _urlAssuntos = URL_BASE;

              _httpBackend.expectGET(_urlAssuntos).respond(400);

              _AltKooponMensagemService.listarAssuntos()
              .then(function(){expect(true).toBe(false)})
              .catch(function(erro) {
                expect(erro).toBeDefined();
              });

              _httpBackend.flush();
            })

            it('deve listar os assuntos corretamente', function() {
              var _urlAssuntos = URL_BASE;
              var _resposta = [{assunto: 'x', texto: 'y'}];

              _httpBackend.expectGET(_urlAssuntos).respond(200, _resposta);

              _AltKooponMensagemService.listarAssuntos()
              .then(function(msgs) {
                msgs.forEach(function(msg) {
                  expect(msg instanceof _AltKooponMensagemModel).toBe(true);
                });
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();
            })
          });

          describe('listarMensagensDaEmpresa', function(){
            it('NÃO deve tentar receber as mensagens da empresa em questao, empresas não definido', function(){
              var _empresaId = 1;
              var _urlAssuntos = URL_BASE + '/' + _empresaId;
              var _resposta = {'1': [{assunto: 'a', idMensagem: 2, texto: 'aaaa'}]};
              var _result = [{id: '1', nome: 'a', assuntos: _resposta[1]}];

              var _empresas = undefined;

              _AltKooponMensagemService
                .listarMensagensDaEmpresa(_empresaId, _empresas)
                .then(function(){expect(true).toBe(false)})
                .catch(function(erro){
                  expect(erro).toBeDefined();
                  expect(erro instanceof TypeError).toBeDefined();
                  expect(erro.message).toEqual('Empresas deve ser um array.');
                });

              _rootScope.$digest();
            })

            it('deve tentar receber as mensagens da empresa em questao, mas recebe um erro', function(){
              var _empresaId = 1;
              var _urlAssuntos = URL_BASE + '/' + _empresaId;
              var _resposta = {'1': [{assunto: 'a', idMensagem: 2, texto: 'aaaa'}]};
              var _result = [{id: '1', nome: 'a', assuntos: _resposta[1]}];

              var _empresas = [{nome: 'a', id: 1}];

              _httpBackend.expectGET(_urlAssuntos).respond(404);

              _AltKooponMensagemService
                .listarMensagensDaEmpresa(_empresaId, _empresas)
                .then(function(){expect(true).toBe(false)})
                .catch(function(erro){
                  expect(erro).toBeDefined();
                });

              _httpBackend.flush();
            })

            it('Deve receber as mensagens da empresa em questao corretamente', function(){
              var _empresaId = 1;
              var _urlAssuntos = URL_BASE + '/' + _empresaId;
              var _resposta = {'1': [{assunto: 'a', idMensagem: 2, texto: 'aaaa'}]};
              var _result = [{id: '1', nome: 'a', assuntos: _resposta[1]}];
              var _empresas = [
                  {nome: 'a', idAssinante: 1}
              ];

              _httpBackend.expectGET(_urlAssuntos).respond(200, _resposta);

              _AltKooponMensagemService
              .listarMensagensDaEmpresa(_empresaId, _empresas)
              .then(function(msg) {
                expect(msg).toEqual(_result);
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();
            })
          });

          describe('listarMensagens', function() {
            it('deve tentar listar assuntos, mas servidor retorna erro', function() {
              var _id = 1;
              var _urlAssuntos = URL_BASE + '/' + _id;

              _httpBackend.expectGET(_urlAssuntos).respond(400);

              _AltKooponMensagemService.listarMensagens(_id)
              .then(function(){expect(true).toBe(false)})
              .catch(function(erro) {
                expect(erro).toBeDefined();
              });

              _httpBackend.flush();
            })

            it('deve listar os assuntos corretamente - sem idEmpresa', function() {
              var _id = 1;
              var _urlAssuntos = URL_BASE + '/' + _id;
              var _resposta = [{assunto: 'x', texto: 'y'}];

              _httpBackend.expectGET(_urlAssuntos).respond(200, _resposta);

              _AltKooponMensagemService.listarMensagens(_id)
              .then(function(msgs) {
                msgs.forEach(function(msg) {
                  expect(msg instanceof _AltKooponMensagemModel).toBe(true);
                });
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();
            })

            it('deve listar os assuntos corretamente - com idEmpresa', function() {
              var _id = 1;
              var _idEmpresa = 2;
              var _urlAssuntos = URL_BASE + '/' + _id + '/clientes/' + _idEmpresa;
              var _resposta = [{assunto: 'x', texto: 'y'}];

              _httpBackend.expectGET(_urlAssuntos).respond(200, _resposta);

              _AltKooponMensagemService.listarMensagens(_id, _idEmpresa)
              .then(function(msgs) {
                msgs.forEach(function(msg) {
                  expect(msg instanceof _AltKooponMensagemModel).toBe(true);
                });
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();
            })
          })

          describe('enviar', function() {
            it('deve tentar enviar mensagem, mas servidor retorna erro', function() {
              var _msg = new _AltKooponMensagemModel('a', 'b');

              _httpBackend.expectPOST(URL_BASE, _msg).respond(400);

              _AltKooponMensagemService.enviar(_msg)
              .then(function(){expect(true).toBe(false)})
              .catch(function(erro) {
                expect(erro).toBeDefined();
              });

              _httpBackend.flush();
            })

            it('deve enviar mensagem corretamente', function() {
              var _msg = new _AltKooponMensagemModel('a', 'b');
              var _resposta = {assunto: 'a', texto: 'b'};

              _httpBackend.expectPOST(URL_BASE, _msg).respond(200, _resposta);

              _AltKooponMensagemService.enviar(_msg)
              .then(function(msg) {
                expect(msg instanceof _AltKooponMensagemModel).toBe(true);
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();

            })

            it('deve enviar mensagem corretamente - com idAssunto', function() {
              var _id = 1;
              var _msg = new _AltKooponMensagemModel('a', 'b');
              var _resposta = {assunto: 'a', texto: 'b'};

              _httpBackend.expectPOST(URL_BASE + '/' + _id, _msg).respond(200, _resposta);

              _AltKooponMensagemService.enviar(_msg, _id)
              .then(function(msg) {
                expect(msg instanceof _AltKooponMensagemModel).toBe(true);
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();
            })

            it('deve enviar mensagem corretamente - com idAssunto e idEmpresa', function() {
              var _id = 1;
              var _idEmpresa = 2;
              var _msg = new _AltKooponMensagemModel('a', 'b');
              var _resposta = {assunto: 'a', texto: 'b'};

              _httpBackend.expectPOST(URL_BASE + '/' + _id + '/clientes/' + _idEmpresa, _msg).respond(200, _resposta);

              _AltKooponMensagemService.enviar(_msg, _id, _idEmpresa)
              .then(function(msg) {
                expect(msg instanceof _AltKooponMensagemModel).toBe(true);
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();
            })

            it('deve enviar mensagem corretamente - deve chamar o módulo de notificação com os parâmetros corretos - storage vazia', function() {
              var _id = 1;
              var _idEmpresa = 2;
              var _msg = new _AltKooponMensagemModel('a', 'b');
              var _resposta = {assunto: 'a', texto: 'b'};

              spyOn(_AltKooponNotificacoesManager, 'retorna').and.returnValue({});

              _httpBackend.expectPOST(URL_BASE + '/' + _id + '/clientes/' + _idEmpresa, _msg).respond(200, _resposta);

              _AltKooponMensagemService.enviar(_msg, _id, _idEmpresa)
              .then(function(msg) {
                expect(_AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('limpa', true);
                expect(_AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtd', 1);
                expect(_AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtdUltimaReq', 1);

                expect(msg instanceof _AltKooponMensagemModel).toBe(true);
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();
            })

            it('deve enviar mensagem corretamente - deve chamar o módulo de notificação com os parâmetros corretos - storage cheia', function() {
              var _id = 1;
              var _idEmpresa = 2;
              var _msg = new _AltKooponMensagemModel('a', 'b');
              var _resposta = {assunto: 'a', texto: 'b'};

              spyOn(_AltKooponNotificacoesManager, 'retorna').and.returnValue({
                qtd: 999,
                qtdUltimaReq: 1001,
                limpa: false
              });

              _httpBackend.expectPOST(URL_BASE + '/' + _id + '/clientes/' + _idEmpresa, _msg).respond(200, _resposta);

              _AltKooponMensagemService.enviar(_msg, _id, _idEmpresa)
              .then(function(msg) {
                expect(_AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('limpa', true);
                expect(_AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtd', 1000);
                expect(_AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtdUltimaReq', 1002);

                expect(msg instanceof _AltKooponMensagemModel).toBe(true);
              })
              .catch(function(){expect(true).toBe(false)});

              _httpBackend.flush();
            })
          })

          describe('assuntoLido', function() {
            it('deve tentar enviar o id, mas o servidor retorna erro', function() {
              var _id = 1;

              _httpBackend.expectPUT(URL_BASE + '/' + _id).respond(400);

              _AltKooponMensagemService
              .assuntoLido(_id)
              .then(function() {
                expect(true).toBe(false);
              })
              .catch(function(erro) {
                expect(erro).toBeDefined();
              });

              _httpBackend.flush();
            })

            it('deve enviar o id corretamente', function() {
              var _id = 1;

              _httpBackend.expectPUT(URL_BASE + '/' + _id).respond(200);

              _AltKooponMensagemService
              .assuntoLido(_id)
              .then(function() {
                expect(true).toBe(true);
              })
              .catch(function(erro) {
                expect(true).toBe(false);
              });

              _httpBackend.flush();
            })
          });
        })

        describe('controllers', function() {
              describe('AltKooponNovaMensagemController', function() {
                describe('criação', function() {
                  it('deve ter mensagem como uma instância correta', inject(function($controller) {
                    $controller(NOME_CONTROLLER_NOVA_MENSAGEM, {$scope: _scope});

                    expect(_scope.nmCtrl.mensagem instanceof _AltKooponMensagemModel).toBe(true);
                  }))

                  it('deve ter clientes como o retorno de AltPassaporteUsuarioLogadoManager', inject(function($controller) {
                    var _infoStorage = {
                      assinantesEmpresa: [
                        {nome: 'a', id: 1}
                      ]
                    };

                    spyOn(_AltPassaporteUsuarioLogadoManager, 'retorna').and.returnValue(_infoStorage);

                    $controller(NOME_CONTROLLER_NOVA_MENSAGEM, {$scope: _scope});

                    expect(_scope.nmCtrl.clientes).toEqual(_infoStorage.assinantesEmpresa);
                  }))
                })

                describe('zeraInformacoes', function() {
                  it('deve ter mensagem como uma nova instância', inject(function($controller) {
                    $controller(NOME_CONTROLLER_NOVA_MENSAGEM, {$scope: _scope});

                    var _fakeForm = {
                      $setPristine: jasmine.createSpy()
                    }

                    _scope.nmCtrl.mensagem.assunto = 'ABCDEFG HIJ';
                    _scope.nmCtrl.mensagem.texto = 'KLM NOP Q';
                    _scope.nmCtrl.mensagem.nomeUsuarioPassaporte = 'Meu nome nao importa';
                    _scope.nmCtrl.mensagem.data = '10/10/2010';
                    _scope.nmCtrl.mensagem.anexo = 'texto anexado';

                    _scope.nmCtrl.zeraInformacoes(_fakeForm);

                    expect(_scope.nmCtrl.mensagem instanceof _AltKooponMensagemModel).toBe(true);

                    expect(_scope.nmCtrl.mensagem.assunto).toBeUndefined();
                    expect(_scope.nmCtrl.mensagem.texto).toBeUndefined();
                    expect(_scope.nmCtrl.mensagem.nomeUsuarioPassaporte).toBeUndefined();
                    expect(_scope.nmCtrl.mensagem.data).toBeUndefined();
                    expect(_scope.nmCtrl.mensagem.anexo).toBeUndefined();

                    expect(_fakeForm.$setPristine).toHaveBeenCalled();
                  }))
                })

                describe('enviar', function() {
                  it('deve tentar enviar a mensagem, mas service retorna erro', inject(function($controller) {
                    var _msg = {a: true};
                    var _fakeForm = {
                      $setPristine: jasmine.createSpy()
                    }

                    spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function() {
                      return _q.reject({erro: 1});
                    })

                    $controller(NOME_CONTROLLER_NOVA_MENSAGEM, {$scope: _scope});

                    _scope.nmCtrl.enviar(_msg);

                    _rootScope.$digest();

                    expect(_AltKooponMensagemService.enviar).toHaveBeenCalledWith(_msg, undefined, undefined);
                    expect(_AltModalService.close).not.toHaveBeenCalled();
                    expect(_fakeForm.$setPristine).not.toHaveBeenCalled();
                  }))

                  it('deve enviar a mensagem corretamente', inject(function($controller) {
                    spyOn(_rootScope, '$emit').and.callThrough();
                    var _fakeForm = {
                      $setPristine: jasmine.createSpy()
                    }
                    var _msg = {a: true};
                    var _msgEnviada = {a: true, criadaEm: 'x'};

                    spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function () {
                      return _q.when(_msgEnviada);
                    })

                    $controller(NOME_CONTROLLER_NOVA_MENSAGEM, {$scope: _scope});

                    _scope.nmCtrl.enviar(_msg, _fakeForm);

                    _rootScope.$digest();

                    expect(_AltKooponMensagemService.enviar).toHaveBeenCalledWith(_msg, undefined, undefined);
                    expect(_AltModalService.close).toHaveBeenCalledWith('#modal-nova-mensagem');
                    expect(_rootScope.$emit).toHaveBeenCalledWith('mensagem:novo-assunto', _msgEnviada);
                    expect(_fakeForm.$setPristine).toHaveBeenCalled();
                  }));

                  it('deve enviar a mensagem corretamente - com idEmpresa', inject(function($controller) {
                    spyOn(_rootScope, '$emit').and.callThrough();
                    var _fakeForm = {
                      $setPristine: jasmine.createSpy()
                    }

                    var _msg = {a: true};
                    var _idEmpresa = 1;
                    var _msgEnviada = {a: true, criadaEm: 'x'};

                    spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function () {
                      return _q.when(_msgEnviada);
                    });

                    $controller(NOME_CONTROLLER_NOVA_MENSAGEM, {$scope: _scope});

                    _scope.nmCtrl.enviar(_msg, _fakeForm, _idEmpresa);

                    _rootScope.$digest();

                    expect(_AltKooponMensagemService.enviar).toHaveBeenCalledWith(_msg, undefined, _idEmpresa);
                    expect(_AltModalService.close).toHaveBeenCalledWith('#modal-nova-mensagem');
                    expect(_rootScope.$emit).toHaveBeenCalledWith('mensagem:novo-assunto', _msgEnviada);
                    expect(_fakeForm.$setPristine).toHaveBeenCalled();
                  }));
                });
              });
            });

            describe('directive - alt-koopon-enter-submit', function() {
              var _element;

              beforeEach(function() {
                _element = undefined;
              });

              describe('criação', function() {
                it('deve ser criado corretamente', function() {
                  var _html = '<div alt-koopon-enter-submit seletor="input" btn-submit="#x"><input type="text"/><button type="button" id="x">x</button>';

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();
                });
              });

              describe('onEvent', function() {
                it('não deve acionar o evento, apenas enter pressionado', function() {
                  var _html = '<div alt-koopon-enter-submit seletor="input" btn-submit="#x"><input type="text"/><button type="button" id="x">x</button>';

                  spyOn($.fn, 'click').and.callFake(angular.noop);
                  spyOn($.fn, 'find').and.callThrough();

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  var e = $.Event('keydown', {ctrlKey: true, which: 13});

                  _element.trigger(e);

                  expect(_element.find).toHaveBeenCalledWith("input");
                })

                it('não deve acionar o evento, apenas ctrl pressionado', function() {
                  var _html = '<div alt-koopon-enter-submit seletor="input" btn-submit="#x"><input type="text"/><button type="button" id="x">x</button>';

                  spyOn($.fn, 'click').and.callFake(angular.noop);
                  spyOn($.fn, 'find').and.callThrough();

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  var e = $.Event('keydown', {ctrlKey: true, which: 13});

                  _element.trigger(e);

                  expect(_element.find).toHaveBeenCalledWith("input");
                })

                it('deve acionar o evento, ctrl e enter pressionados', function() {
                  var _html = '<div alt-koopon-enter-submit seletor="input" btn-submit="#x"><input type="text"/><button type="button" id="x">x</button>';

                  spyOn($.fn, 'click').and.callFake(angular.noop);
                  spyOn($.fn, 'find').and.callThrough();

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  var e = $.Event('keydown');

                  e.ctrlKey = true;
                  e.which = 13;

                  _element.trigger(e);

                  expect(_element.find).toHaveBeenCalledWith("input");
                })
              });
            })

            describe('directive - alt-koopon-mensagens-toggle', function() {
              var _element;

              beforeEach(function() {
                _element = undefined;
              });

              describe('criação', function() {
                it('deve ter a diretiva criada corretamente', function() {
                  var _html = '<div alt-koopon-mensagem-toggle>\
                  <h4 class="assunto-mensagem"></h4>\
                  <div class="mensagens-container"></div>\
                  <div class="mensagens-container"></div>\
                  <div class="mensagens-container"></div>\
                  </div>';

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  expect(_element).toBeDefined();
                });
              });

              describe('click', function() {
                it('deve chamar o slideDown e Up - parametros de velocidade corretos', function() {
                  spyOn($.fn, 'slideDown').and.callFake(angular.noop);
                  spyOn($.fn, 'slideUp').and.callFake(angular.noop);

                  var _html = '<div alt-koopon-mensagem-toggle>\
                  <h4 class="assunto-mensagem"></h4>\
                  <div class="mensagens-container"></div>\
                  <div class="mensagens-container"></div>\
                  <div class="mensagens-container"></div>\
                  </div>';

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  _element.find('.assunto-mensagem').click();

                  expect($('a').slideDown).toHaveBeenCalledWith('fast');
                  expect($('a').slideUp).toHaveBeenCalledWith('fast');
                })


                it ('Deve chamar slideup apenas (click na mensagem aberta)', function(){
                  spyOn($.fn, 'slideDown').and.callFake(angular.noop);
                  spyOn($.fn, 'slideUp').and.callFake(angular.noop);
                  spyOn($.fn, 'is').and.returnValue(true);

                  var _html = '<div alt-koopon-mensagem-toggle>\
                  <h4 class="assunto-mensagem"></h4>\
                  <div class="mensagens-container"></div>\
                  </div>';

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  _element.find('.assunto-mensagem').click();

                  expect($('a').slideDown.calls.count()).toBe(0);
                  expect($('a').slideUp.calls.count()).toBe(1);
                })

                it ('Deve chamar slideup apenas (click na mensagem aberta)', function(){
                  spyOn($.fn, 'slideDown').and.callFake(angular.noop);
                  spyOn($.fn, 'slideUp').and.callFake(angular.noop);
                  spyOn($.fn, 'is').and.returnValue(false);

                  var _html = '<div alt-koopon-mensagem-toggle>\
                  <h4 class="assunto-mensagem"></h4>\
                  <div class="mensagens-container"></div>\
                  </div>';

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  _element.find('.assunto-mensagem').click();

                  expect($('a').slideDown.calls.count()).toBe(1);
                  expect($('a').slideUp.calls.count()).toBe(1);
                })
              })
            });

            describe('directive - alt-koopon-mensagens-active', function() {
              var _element;

              beforeEach(function() {
                _element = undefined;
              });

              describe('criação', function() {
                it('deve ter a diretiva criada corretamente', function() {

                  var _html = '<div alt-koopon-mensagem-active></div>';

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  expect(_element).toBeDefined();
                });
              });

              describe('click', function() {
                it('deve chamar o removeClass, mas nao o addClass', function() {
                  spyOn($.fn, 'removeClass').and.callFake(angular.noop);
                  spyOn($.fn, 'hasClass').and.returnValue(true);

                  var _html = '<div alt-koopon-mensagem-active></div>';

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  spyOn($.fn, 'addClass').and.callFake(angular.noop);

                  _element.click();

                  expect($('a').addClass.calls.count()).toBe(0);
                  expect($('a').removeClass.calls.count()).toBe(1);
                })

                it('deve chamar o tanto o addClass quanto o removeClass', function() {
                  spyOn($.fn, 'removeClass').and.callFake(angular.noop);
                  spyOn($.fn, 'hasClass').and.returnValue(false);

                  var _html = '<div alt-koopon-mensagem-active></div>';

                  _element = angular.element(_html);
                  _compile(_element)(_scope);

                  _scope.$digest();

                  spyOn($.fn, 'addClass').and.callFake(angular.noop);
                  spyOn($.fn, 'is').and.returnValue(false);
                  spyOn($.fn, 'next').and.callThrough();

                  _element.click();

                  expect($('a').addClass.calls.count()).toBe(1);
                  expect($('a').removeClass.calls.count()).toBe(1);
                  expect($('a').next.calls.count()).toBe(1);
                })
              })
            });
          });
