'use strict';

describe('Service: AltKooponMensagemContadorEmpresa', function () {
    var _rootScope, _scope, _q, _compile, _httpBackend, _AltKooponMensagemService, _AltKooponMensagemModel,
        _AltPassaporteUsuarioLogadoManager, _AltModalService, _ALT_KOOPON_URL_BASE_API_MENSAGEM;
    var modeloMensagemCompleto;
    var ID_MODAL_MENSAGEM;
    var EVENTO_NOVO_ASSUNTO;
    var NOME_CONTROLLER_MENSAGENS = 'AltKooponMensagensController as akmCtrl';
    var NOME_CONTROLLER_NOVA_MENSAGEM = 'AltKooponNovaMensagemController as nmCtrl';

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

            it('deve listar os assuntos corretamente', function() {
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

            it('deve enviar mensagem corretamente - com id', function() {
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

    describe('controller', function() {
        describe('AltKooponNovaMensagemController', function() {
           describe('criação', function() {
               it('deve ter mensagem como uma instância correta', inject(function($controller) {
                   $controller(NOME_CONTROLLER_NOVA_MENSAGEM, {$scope: _scope});

                   expect(_scope.nmCtrl.mensagem instanceof _AltKooponMensagemModel).toBe(true);
               }))
           })

            describe('enviar', function() {
                it('deve tentar enviar a mensagem, mas service retorna erro', inject(function($controller) {
                    var _msg = {a: true};

                    spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function() {
                        return _q.reject({erro: 1});
                    })

                    $controller(NOME_CONTROLLER_NOVA_MENSAGEM, {$scope: _scope});

                    _scope.nmCtrl.enviar(_msg);

                    _rootScope.$digest();

                    expect(_AltKooponMensagemService.enviar).toHaveBeenCalledWith(_msg);
                    expect(_AltModalService.close).not.toHaveBeenCalled();
                }))

                it('deve enviar a mensagem corretamente', inject(function($controller) {
                    spyOn(_rootScope, '$emit').and.callThrough();
                    var _msg = {a: true};
                    var _msgEnviada = {a: true, criadaEm: 'x'};

                    spyOn(_AltKooponMensagemService, 'enviar').and.callFake(function () {
                        return _q.when(_msgEnviada);
                    })

                    $controller(NOME_CONTROLLER_NOVA_MENSAGEM, {$scope: _scope});

                    _scope.nmCtrl.enviar(_msg);

                    _rootScope.$digest();

                    expect(_AltKooponMensagemService.enviar).toHaveBeenCalledWith(_msg);
                    expect(_AltModalService.close).toHaveBeenCalledWith('#modal-nova-mensagem');
                    expect(_rootScope.$emit).toHaveBeenCalledWith('mensagem:novo-assunto', _msgEnviada);
                }));
            });
        });

        describe('AltKooponMensagensController', function() {
            describe('criação', function() {
                it('deve ter o valor correto para a a propriedade mensagem', inject(function($controller) {
                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    expect(_scope.akmCtrl.mensagem instanceof _AltKooponMensagemModel).toBe(true);
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
                    spyOn(_rootScope, '$on').and.callThrough();

                    spyOn(_AltKooponMensagemService, 'listarAssuntos').and.callFake(function() {
                        return _q.when([]);
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    expect(_rootScope.$on).toHaveBeenCalled();
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
                var _assuntos = [{idMensagem: 1, assunto: 'x'}, {idMensagem: 2, assunto: 'y'}];

                beforeEach(function() {
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

                    _scope.akmCtrl.listarMensagens(_id);

                    _rootScope.$digest();

                    expect(_scope.akmCtrl.assuntos).toEqual(_assuntos); // sem mensagens
                }));

                it('deve buscar os assuntos corretamente', inject(function($controller) {
                    var _id = 1;

                    var _respostaService = [{texto: 'abc', nomeUsuarioPassaporte: 'fulano1', data: '11/12/2013'},
                        {texto: 'abc', nomeUsuarioPassaporte: 'fulano2', data: '11/12/2013'}];

                    var _resultadoFinal = [{idMensagem: 1, assunto: 'x', mensagens: [{texto: 'abc', nomeUsuarioPassaporte: 'fulano1', data: '11/12/2013'},
                        {texto: 'abc', nomeUsuarioPassaporte: 'fulano2', data: '11/12/2013'}]},
                        {idMensagem: 2, assunto: 'y'}];

                    spyOn(_AltKooponMensagemService, 'listarMensagens').and.callFake(function() {
                        return _q.when(_respostaService);
                    });

                    spyOn(_AltKooponMensagemService, 'assuntoLido').and.callFake(function() {
                        return _q.when({});
                    });

                    $controller(NOME_CONTROLLER_MENSAGENS, {$scope: _scope});

                    _rootScope.$digest();

                    _scope.akmCtrl.listarMensagens(_id);

                    _rootScope.$digest();

                    expect(_scope.akmCtrl.assuntos).toEqual(_resultadoFinal);
                }));
            });
        })
    });

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
            it('deve chamar o slideDown e Up', function() {
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
            it('deve chamar o slideDown e Up', function() {
                spyOn($.fn, 'addClass').and.callFake(angular.noop);
                spyOn($.fn, 'removeClass').and.callFake(angular.noop);

                var _html = '<div alt-koopon-mensagem-active></div>';

                _element = angular.element(_html);
                _compile(_element)(_scope);

                _scope.$digest();

                _element.click();

                expect($('a').addClass).toHaveBeenCalledWith('active');
                expect($('a').removeClass).toHaveBeenCalledWith('active');
            })
        })
    });
});
