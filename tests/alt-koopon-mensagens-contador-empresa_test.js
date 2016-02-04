'use strict';

describe('Service: AltKooponMensagemContadorEmpresa', function () {
    var _rootScope, _scope, _q, _compile, _httpBackend, _AltKooponMensagemService, _AltKooponMensagemModel,
        _AltPassaporteUsuarioLogadoManager, _AltModalService, _ALT_KOOPON_URL_BASE_API_MENSAGEM;
    var modeloMensagemCompleto;
    var ID_MODAL_MENSAGEM;
    var EVENTO_NOVO_ASSUNTO;
    var NOME_CONTROLLER_MENSAGENS = 'AltKooponMensagensController as akmCtrl';
    var NOME_CONTROLLER_NOVA_MENSAGEM = 'AltKooponNovaMensagemController as nmCtrl';
    var NOME_CONTROLLER_EMPRESAS_MENSAGENS = 'AltKooponEmpresasComMensagensController as empMCtrl';

    beforeEach(module('alt.koopon.mensagens-contador-empresa'));

    beforeEach(inject(function($injector) {
        _rootScope = $injector.get('$rootScope');
        _scope = _rootScope.$new();_q = $injector.get('$q');
        _compile = $injector.get('$compile');
        _httpBackend = $injector.get('$httpBackend');
        ID_MODAL_MENSAGEM = $injector.get('ID_MODAL_MENSAGEM');
        EVENTO_NOVO_ASSUNTO = $injector.get('EVENTO_NOVO_ASSUNTO');
        _AltKooponMensagemService = $injector.get('AltKooponMensagemService');
        _AltKooponMensagemModel = $injector.get('AltKooponMensagemModel');
        _AltModalService = $injector.get('AltModalService');
        _AltPassaporteUsuarioLogadoManager = $injector.get('AltPassaporteUsuarioLogadoManager');
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
    }));

    describe('constantes', function() {
        it('deve ter o valor correto para ID_MODAL_MENSAGEM', function() {
            expect(ID_MODAL_MENSAGEM).toEqual('#modal-nova-mensagem');
        })

        it('deve ter o valor correto para EVENTO_NOVO_ASSUNTO', function() {
            expect(EVENTO_NOVO_ASSUNTO).toEqual('mensagem:novo-assunto');
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
            it('deve tentar listar as empresas com os asssuntos, mas servidor retorna erro', function() {
                var _urlAssuntos = URL_BASE;

                _httpBackend.expectGET(_urlAssuntos).respond(400);

                _AltKooponMensagemService
                  .listarEmpresasAssuntos()
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

                spyOn(_AltPassaporteUsuarioLogadoManager, 'retorna').and.returnValue({
                  assinantesEmpresa: [
                    {id: 1, nome: '1_nome'},
                    {id: 2, nome: '2_nome'},
                    {id: 3, nome: '3_nome'}
                  ]
                })

                _httpBackend.expectGET(_urlAssuntos).respond(200, _resposta);

                _AltKooponMensagemService
                  .listarEmpresasAssuntos()
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
        })

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

        describe('AltKooponMensagensController', function() {
            describe('criação', function() {
                it('deve ter o valor correto para a a propriedade mensagem', inject(function($controller) {
                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    expect(_scope.akmCtrl.mensagem instanceof _AltKooponMensagemModel).toBe(true);
                }))

                it('deve ter o valor correto para a a propriedade AltKooponMensagemModel', inject(function($controller) {
                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

					expect(_scope.akmCtrl.AltKooponMensagemModel).toEqual(_AltKooponMensagemModel);
                }))

                it('deve ter mensagens como um array vazio', inject(function($controller) {
                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    expect(_scope.akmCtrl.assuntos).toEqual([]);
                }))

                it('deve ter novaMensagem como false', inject(function($controller) {
                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    expect(_scope.akmCtrl.novaMensagem).toBe(false);
                }))

            })

            describe('onLoad', function() {
                it('deve tentar buscar os assuntos, mas service retorna erro', inject(function($controller) {
                    spyOn(_AltKooponMensagemService, 'listarAssuntos').and.callFake(function() {
                        return _q.reject({erro: 1});
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _rootScope.$digest();

                    expect(_scope.akmCtrl.assuntos).toEqual([]);
                }));

                it('deve buscar os assuntos corretamente', inject(function($controller) {
                    var _resposta = [{assunto: 'x'}, {assunto: 'y'}];

                    spyOn(_AltKooponMensagemService, 'listarAssuntos').and.callFake(function() {
                        return _q.when(_resposta);
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _rootScope.$digest();

                    expect(_scope.akmCtrl.assuntos).toEqual(_resposta);
                }));

                it('deve registrar o evento de novo assunto', inject(function($controller) {
                    spyOn(_scope, '$on').and.callThrough();
                    spyOn(_scope, '$broadcast').and.callThrough();

                    spyOn(_AltKooponMensagemService, 'listarAssuntos').and.callFake(function() {
                        return _q.when([]);
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _rootScope.$digest();

                    expect(_scope.akmCtrl.assuntos.length).toBe(0);

                    _scope.$broadcast(EVENTO_NOVO_ASSUNTO, {a: true});

                    _scope.$digest();

                    expect(_scope.$on).toHaveBeenCalled();

                    expect(_scope.akmCtrl.assuntos.length).toBe(1);
                }));
            });

            describe('responder', function() {
                beforeEach(function() {
                    spyOn(_AltKooponMensagemService, 'listarAssuntos').and.callFake(function() {
                        return _q.when([
                            {
                                assunto: 'x', texto: 'y', idMensagem: 1, mensagens: [
                                {algumaCoisa: true},
                                {algumaCoisa: false}]
                            },
                            {
                                assunto: 'x', texto: 'y', idMensagem: 999, mensagens: [
                                {algumaCoisa: true},
                                {algumaCoisa: false}]
                            }
                        ]);
                    })
                })

                it('deve tentar enviar a mensagem, mas service retorna erro', inject(function($controller) {
                    var _id = 1;
                    var _msg = {a: true};

                    spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function() {
                        return _q.reject({erro: 1});
                    })

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _scope.akmCtrl.responder(_msg, _id);

                    _rootScope.$digest();

                    expect(_AltKooponMensagemService.enviar).toHaveBeenCalledWith(_msg, _id);
                }))

                it('deve enviar a mensagem corretamente, limpando o campo de mensagem', inject(function($controller) {
                    var _id = 1;
                    var _msg = {a: true, mensagens: []};
                    var _msgEnviada = {a: true, criadaEm: 'x', idMensagem: 1};

                    spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function() {
                        return _q.when(_msgEnviada);
                    })

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _scope.akmCtrl.responder(_msg, _id);

                    _rootScope.$digest();

                    expect(_AltKooponMensagemService.enviar).toHaveBeenCalledWith(_msg, _id);
                    expect(_scope.akmCtrl.mensagem).toBe("");
                }))

                it('deve enviar a mensagem corretamente', inject(function($controller) {
                    var _id = 1;
                    var _msg = {a: true, mensagens: []};
                    var _msgEnviada = {a: true, criadaEm: 'x', idMensagem: 1};

                    spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function() {
                        return _q.when(_msgEnviada);
                    })

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _scope.akmCtrl.responder(_msg, _id);

                    _rootScope.$digest();

                    expect(_AltKooponMensagemService.enviar).toHaveBeenCalledWith(_msg, _id);
                }))

                it('deve enviar a mensagem corretamente e apendar a mesma no array de mensagens', inject(function($controller) {
                    var _id = 1;
                    var _msg = {a: true, idMensagem: 1, mensagens: []};
                    var _msgEnviada = {a: true, criadaEm: 'x'};

                    spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function() {
                        return _q.when(_msgEnviada);
                    })

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _scope.akmCtrl.responder(_msg, _id);

                    _rootScope.$digest();

                    expect(_AltKooponMensagemService.enviar).toHaveBeenCalledWith(_msg, _id);
                    expect(_scope.akmCtrl.assuntos[0].mensagens[2]).toEqual(_msgEnviada);
                }))
            });

            describe('listarMensagens', function() {
                var _assuntos = [];

                beforeEach(function() {
					_assuntos = [					
						{
							idMensagem: 1, 
							assunto: 'x'
						}, 
						{
							idMensagem: 2, 
							assunto: 'y'
						}
					];
					
                    spyOn(_AltKooponMensagemService, 'listarAssuntos').and.callFake(function() {
                        return _q.when(_assuntos);
                    })
                })

                it('deve tentar buscar as mensagens, mas service retorna erro', inject(function($controller) {
                    var _id = 1;

                    spyOn(_AltKooponMensagemService, 'listarMensagens').and.callFake(function() {
                        return _q.reject({erro: 1});
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _rootScope.$digest();
					
					expect(_scope.akmCtrl.assuntos).toEqual(_assuntos); // sem mensagens

					_scope.akmCtrl.listarMensagens(_id, {});
					
					_rootScope.$digest();
					
                    expect(_scope.akmCtrl.assuntos).toEqual(_assuntos); // sem mensagens
					
					expect(_AltKooponMensagemService.listarMensagens).toHaveBeenCalledWith(_id);
                    
                }));

                it('deve buscar os assuntos corretamente', inject(function($controller) {
                    var _id = 1;

                    var _respostaServiceMensagens = [
							{
								texto: 'abc', 
								nomeUsuarioPassaporte: 'fulano1', 
								data: '11/12/2013'
							},
							{
								texto: 'abc', 
								nomeUsuarioPassaporte: 'fulano2', 
								data: '11/12/2013'
							}
						];
						
						
                    var _resultadoFinal = [
						{
							idMensagem: 1, 
							assunto: 'x', 
							mensagens: [
								{
									texto: 'abc', 
									nomeUsuarioPassaporte: 'fulano1', 
									data: '11/12/2013'
								},
								{	
									texto: 'abc', 
									nomeUsuarioPassaporte: 'fulano2', 
									data: '11/12/2013'
								}
							]
						},
                        {
							idMensagem: 2, 
							assunto: 'y'
						}
					];

                    spyOn(_AltKooponMensagemService, 'listarMensagens').and.callFake(function() {
                        return _q.when(_respostaServiceMensagens);
                    });

                    spyOn(_AltKooponMensagemService, 'assuntoLido').and.callFake(function() {
                        return _q.when({});
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _rootScope.$digest();									
					
					
					expect(_scope.akmCtrl.assuntos).toEqual(_assuntos);

                    _scope.akmCtrl.listarMensagens(_id, {});
					
					_rootScope.$digest();

                    expect(_scope.akmCtrl.assuntos).toEqual(_resultadoFinal);
					
					expect(_AltKooponMensagemService.listarMensagens).toHaveBeenCalledWith(_id);
                }));
				
			    it('NÃO deve buscar os assuntos, o mesmo não está aberto', inject(function($controller) {
                    var _id = 1;

                    var _respostaServiceMensagens = [
							{
								texto: 'abc', 
								nomeUsuarioPassaporte: 'fulano1', 
								data: '11/12/2013'
							},
							{
								texto: 'abc', 
								nomeUsuarioPassaporte: 'fulano2', 
								data: '11/12/2013'
							}
						];
						
						
                    var _resultadoFinal = [
						{
							idMensagem: 1, 
							assunto: 'x', 
							mensagens: [
								{
									texto: 'abc', 
									nomeUsuarioPassaporte: 'fulano1', 
									data: '11/12/2013'
								},
								{	
									texto: 'abc', 
									nomeUsuarioPassaporte: 'fulano2', 
									data: '11/12/2013'
								}
							]
						},
                        {
							idMensagem: 2, 
							assunto: 'y'
						}
					];

                    spyOn(_AltKooponMensagemService, 'listarMensagens').and.callFake(function() {
                        return _q.when(_respostaServiceMensagens);
                    });

                    spyOn(_AltKooponMensagemService, 'assuntoLido').and.callFake(function() {
                        return _q.when({});
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _rootScope.$digest();									
					
					
					expect(_scope.akmCtrl.assuntos).toEqual(_assuntos);

                    _scope.akmCtrl.listarMensagens(_id, {aberto: true});
					
					_rootScope.$digest();

					expect(_scope.akmCtrl.assuntos).not.toEqual(_resultadoFinal);
                    expect(_scope.akmCtrl.assuntos).toEqual(_assuntos);
					
					expect(_AltKooponMensagemService.listarMensagens).not.toHaveBeenCalled();
                }));
				
			    it('Deve abrir o assunto, buscando as informacoes', inject(function($controller) {
                    var _id = 1;

                    var _respostaServiceMensagens = [
							{
								texto: 'abc', 
								nomeUsuarioPassaporte: 'fulano1', 
								data: '11/12/2013'
							},
							{
								texto: 'abc', 
								nomeUsuarioPassaporte: 'fulano2', 
								data: '11/12/2013'
							}
						];
						
						
                    var _resultadoFinal = [
						{
							idMensagem: 1, 
							assunto: 'x', 
							aberto: true,
							mensagens: [
								{
									texto: 'abc', 
									nomeUsuarioPassaporte: 'fulano1', 
									data: '11/12/2013'
								},
								{	
									texto: 'abc', 
									nomeUsuarioPassaporte: 'fulano2', 
									data: '11/12/2013'
								}
							]
						},
                        {
							idMensagem: 2, 
							assunto: 'y'
						}
					];

                    spyOn(_AltKooponMensagemService, 'listarMensagens').and.callFake(function() {
                        return _q.when(_respostaServiceMensagens);
                    });

                    spyOn(_AltKooponMensagemService, 'assuntoLido').and.callFake(function() {
                        return _q.when({});
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _rootScope.$digest();									
					
					
					expect(_scope.akmCtrl.assuntos).toEqual(_assuntos);

                    _scope.akmCtrl.listarMensagens(_id, _scope.akmCtrl.assuntos[0]);
					
					_rootScope.$digest();
					
					expect(_scope.akmCtrl.assuntos).toEqual(_resultadoFinal);
					
					expect(_AltKooponMensagemService.listarMensagens).toHaveBeenCalled();
                }));
				
			    it('Deve fechar o assunto, sem buscar informacoes', inject(function($controller) {
                    var _id = 1;

                    var _respostaServiceMensagens = [
							{
								texto: 'abc', 
								nomeUsuarioPassaporte: 'fulano1', 
								data: '11/12/2013'
							},
							{
								texto: 'abc', 
								nomeUsuarioPassaporte: 'fulano2', 
								data: '11/12/2013'
							}
						];
						
						
                    var _resultadoFinal = [
						{
							idMensagem: 1, 
							assunto: 'x', 
							aberto: false,
							
						},
                        {
							idMensagem: 2, 
							assunto: 'y'
						}
					];

                    spyOn(_AltKooponMensagemService, 'listarMensagens').and.callFake(function() {
                        return _q.when(_respostaServiceMensagens);
                    });

                    spyOn(_AltKooponMensagemService, 'assuntoLido').and.callFake(function() {
                        return _q.when({});
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _rootScope.$digest();									
					
					expect(_scope.akmCtrl.assuntos).toEqual(_assuntos);
					
					_scope.akmCtrl.assuntos[0].aberto = true;

                    _scope.akmCtrl.listarMensagens(_id, _scope.akmCtrl.assuntos[0]);
					
					_rootScope.$digest();
					
					expect(_scope.akmCtrl.assuntos).toEqual(_resultadoFinal);
					
					expect(_AltKooponMensagemService.listarMensagens).not.toHaveBeenCalled();
                }));
				
				
				
            });

            describe('AltKooponEmpresasComMensagensController', function() {

              describe('criação', function() {
                it('deve ser criada corretamente', inject(function($controller) {
                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});
                }))

                it('deve empresas como um array vazio', inject(function($controller) {
                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});

                  expect(_scope.empMCtrl.empresas).toEqual([]);
                }))

                it('deve carregar o AltKooponMensagemModel', inject(function($controller) {
                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});

                  expect(_scope.empMCtrl.AltKooponMensagemModel).toEqual(_AltKooponMensagemModel);
                }))
              })

              describe('onLoad', function() {
                it('não deve preencher empresas, service retorna erro', inject(function($controller) {
                  spyOn(_AltKooponMensagemService, 'listarEmpresasAssuntos').and.callFake(function() {
                    return _q.reject({erro: true});
                  });

                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});

                  _rootScope.$digest();

                  expect(_scope.empMCtrl.empresas.length).toBe(0);
                }))

                it('deve preencher empresas com que o service retorna', inject(function($controller) {
                  var _empresas = [1, 2, 3];

                  spyOn(_AltKooponMensagemService, 'listarEmpresasAssuntos').and.callFake(function() {
                    return _q.when(_empresas);
                  });

                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});

                  _rootScope.$digest();

                  expect(_scope.empMCtrl.empresas.length).toBe(3);
                  expect(_scope.empMCtrl.empresas[0]).toBe(1);
                  expect(_scope.empMCtrl.empresas[1]).toBe(2);
                  expect(_scope.empMCtrl.empresas[2]).toBe(3);
                  expect(_scope.empMCtrl.empresas[3]).toBeUndefined();
                }))

                it('deve registrar o evento de novo assunto', inject(function($controller) {
                  spyOn(_scope, '$on').and.callThrough();
                  spyOn(_scope, '$broadcast').and.callThrough();

                  var _novoAssunto = {empresaEscolhida: "1", assunto: 'a', texto: 'b'};

                  spyOn(_AltKooponMensagemService, 'listarEmpresasAssuntos').and.callFake(function() {
                      return _q.when([
                        {id: 1, assuntos: []},
                        {id: 2, assuntos: []}
                      ]);
                  });

                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});

                  _rootScope.$digest();

                  expect(_scope.empMCtrl.empresas[0].assuntos.length).toBe(0);
                  expect(_scope.empMCtrl.empresas[1].assuntos.length).toBe(0);

                  _scope.$broadcast(EVENTO_NOVO_ASSUNTO, _novoAssunto);

                  _scope.$digest();

                  expect(_scope.$on).toHaveBeenCalled();

                  expect(_scope.empMCtrl.empresas[0].assuntos.length).toBe(1);
                  expect(_scope.empMCtrl.empresas[0].assuntos[0]).toEqual(_novoAssunto);

                  expect(_scope.empMCtrl.empresas[1].assuntos.length).toBe(0);
                }));
              })

              describe('listarMensagens', function() {
                it('não deve listar mensagens, service retorna erro', inject(function($controller) {
                  var _empresas = [
                    {id: 1, nome: 'a', assuntos: [
                      {idMensagem: 11, mensagens: []}
                    ]},
                    {id: 2, nome: 'b', assuntos: [
                      {idMensagem: 22, mensagens: []}
                    ]},
                    {id: 3, nome: 'c', assuntos: [
                      {idMensagem: 33, mensagens: []}
                    ]}
                  ];

                  var _idEmpresa = 1;
                  var _idAssunto = 11;

                  spyOn(_AltKooponMensagemService, 'listarEmpresasAssuntos').and.callFake(function() {
                    return _q.when(_empresas);
                  });

                  spyOn(_AltKooponMensagemService, 'listarMensagens').and.callFake(function() {
                    return _q.reject({erro: true});
                  });

                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});

                  _scope.empMCtrl.listarMensagens(_idEmpresa, _idAssunto);

                  _rootScope.$digest();

                  expect(_scope.empMCtrl.empresas.length).toBe(3);
                  expect(_scope.empMCtrl.empresas[0].assuntos.length).toBe(1);
                  expect(_scope.empMCtrl.empresas[0].assuntos[0].mensagens.length).toBe(0);

                  expect(_scope.empMCtrl.empresas[1].assuntos.length).toBe(1);
                  expect(_scope.empMCtrl.empresas[1].assuntos[0].mensagens.length).toBe(0);

                  expect(_scope.empMCtrl.empresas[2].assuntos.length).toBe(1);
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens.length).toBe(0);
                }));

                it('deve listar mensagens corretamente', inject(function($controller) {
                  var _empresas = [
                    {id: 1, nome: 'a', assuntos: [
                      {idMensagem: 11, mensagens: []}
                    ]},
                    {id: 2, nome: 'b', assuntos: [
                      {idMensagem: 22, mensagens: []}
                    ]},
                    {id: 3, nome: 'c', assuntos: [
                      {idMensagem: 33, mensagens: []}
                    ]}
                  ];

                  var _mensagens = [
                    {texto: '11-aa'},
                    {texto: '11-bb'},
                    {texto: '11-cc'},
                    {texto: '11-dd'}
                  ];

                  var _idEmpresa = 1;
                  var _idAssunto = 11;

                  spyOn(_AltKooponMensagemService, 'listarEmpresasAssuntos').and.callFake(function() {
                    return _q.when(_empresas);
                  });

                  spyOn(_AltKooponMensagemService, 'listarMensagens').and.callFake(function() {
                    return _q.when(_mensagens);
                  });

                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});

                  _scope.empMCtrl.listarMensagens(_idEmpresa, _idAssunto);

                  _rootScope.$digest();

                  expect(_scope.empMCtrl.empresas.length).toBe(3);
                  expect(_scope.empMCtrl.empresas[0].assuntos.length).toBe(1);
                  expect(_scope.empMCtrl.empresas[0].assuntos[0].mensagens.length).toBe(4);
                  expect(_scope.empMCtrl.empresas[0].assuntos[0].mensagens[0].texto).toEqual('11-aa');
                  expect(_scope.empMCtrl.empresas[0].assuntos[0].mensagens[1].texto).toEqual('11-bb');
                  expect(_scope.empMCtrl.empresas[0].assuntos[0].mensagens[2].texto).toEqual('11-cc');
                  expect(_scope.empMCtrl.empresas[0].assuntos[0].mensagens[3].texto).toEqual('11-dd');

                  expect(_scope.empMCtrl.empresas[1].assuntos.length).toBe(1);
                  expect(_scope.empMCtrl.empresas[1].assuntos[0].mensagens.length).toBe(0);

                  expect(_scope.empMCtrl.empresas[2].assuntos.length).toBe(1);
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens.length).toBe(0);
                }));
              })

              describe('responder', function() {
                it('não deve adicionar mensagens, service retorna erro', inject(function($controller) {
                  var _mensagens = [
                    {texto: '33-aa'},
                    {texto: '33-bb'},
                    {texto: '33-cc'},
                    {texto: '33-dd'}
                  ];

                  var _empresas = [
                    {id: 1, nome: 'a', assuntos: [
                      {idMensagem: 11, mensagens: []}
                    ]},
                    {id: 2, nome: 'b', assuntos: [
                      {idMensagem: 22, mensagens: []}
                    ]},
                    {id: 3, nome: 'c', assuntos: [
                      {idMensagem: 33, mensagens: _mensagens}
                    ]}
                  ];

                  var _idEmpresa = 3;
                  var _idAssunto = 33;
                  var _mensagem = {assunto: 'a', texto: 'b'};

                  spyOn(_AltKooponMensagemService, 'listarEmpresasAssuntos').and.callFake(function() {
                    return _q.when(_empresas);
                  });

                  spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function() {
                    return _q.reject({erro: true});
                  });

                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});

                  _scope.empMCtrl.responder(_mensagem, _idEmpresa, _idAssunto);

                  _rootScope.$digest();

                  expect(_scope.empMCtrl.empresas.length).toBe(3);
                  expect(_scope.empMCtrl.empresas[0].assuntos.length).toBe(1);
                  expect(_scope.empMCtrl.empresas[0].assuntos[0].mensagens.length).toBe(0);

                  expect(_scope.empMCtrl.empresas[1].assuntos[0].mensagens.length).toBe(0);

                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens.length).toBe(4);
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[0]).toEqual({texto: '33-aa'});
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[1]).toEqual({texto: '33-bb'});
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[2]).toEqual({texto: '33-cc'});
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[3]).toEqual({texto: '33-dd'});
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[4]).toBeUndefined();
                }));

                it('deve adicionar a nova mensagem corretamente', inject(function($controller) {
                  var _mensagens = [
                    {texto: '33-aa'},
                    {texto: '33-bb'},
                    {texto: '33-cc'},
                    {texto: '33-dd'}
                  ];

                  var _empresas = [
                    {id: 1, nome: 'a', assuntos: [
                      {idMensagem: 11, mensagens: []}
                    ]},
                    {id: 2, nome: 'b', assuntos: [
                      {idMensagem: 22, mensagens: []}
                    ]},
                    {id: 3, nome: 'c', assuntos: [
                      {idMensagem: 33, mensagens: _mensagens}
                    ]}
                  ];

                  var _idEmpresa = 3;
                  var _idAssunto = 33;
                  var _mensagem = {assunto: 'a', texto: 'b'};

                  spyOn(_AltKooponMensagemService, 'listarEmpresasAssuntos').and.callFake(function() {
                    return _q.when(_empresas);
                  });

                  spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function() {
                    return _q.when(_mensagem);
                  });

                  $controller(NOME_CONTROLLER_EMPRESAS_MENSAGENS, {$scope: _scope});

                  _scope.empMCtrl.responder(_mensagem, _idEmpresa, _idAssunto);

                  _rootScope.$digest();

                  expect(_scope.empMCtrl.mensagem).toBe("");
                  expect(_scope.empMCtrl.empresas.length).toBe(3);
                  expect(_scope.empMCtrl.empresas[0].assuntos.length).toBe(1);
                  expect(_scope.empMCtrl.empresas[0].assuntos[0].mensagens.length).toBe(0);

                  expect(_scope.empMCtrl.empresas[1].assuntos[0].mensagens.length).toBe(0);

                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens.length).toBe(5);
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[0]).toEqual({texto: '33-aa'});
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[1]).toEqual({texto: '33-bb'});
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[2]).toEqual({texto: '33-cc'});
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[3]).toEqual({texto: '33-dd'});
                  expect(_scope.empMCtrl.empresas[2].assuntos[0].mensagens[4]).toEqual({assunto: 'a', texto: 'b'});
                }));
              })
            })
        })
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

				_element.click();

				expect($('a').addClass.calls.count()).toBe(1);
                expect($('a').removeClass.calls.count()).toBe(1);
            })
        })
    });
});
