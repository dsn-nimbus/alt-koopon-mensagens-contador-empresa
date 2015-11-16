;(function() {
    "use strict";

    angular
        .module('alt.koopon.mensagens-contador-empresa', [
            'ngResource',
            'alt.passaporte-usuario-logado',
            'alt.modal-service'
        ])
        .provider('ALT_KOOPON_URL_BASE_API_MENSAGEM', [function() {
            this.urlBase = '/koopon-rest-api/';

            this.$get = function() {
                return this.urlBase;
            };
        }])
        .constant('ID_MODAL_MENSAGEM', '#modal-nova-mensagem')
        .constant('EVENTO_NOVO_ASSUNTO', 'mensagem:novo-assunto')
        .factory('AltKooponMensagemResource', ['$resource', 'ALT_KOOPON_URL_BASE_API_MENSAGEM', function($resource, ALT_KOOPON_URL_BASE_API_MENSAGEM) {
            var _url = ALT_KOOPON_URL_BASE_API_MENSAGEM + 'mensagens/:id';
            var _params = {
                id: '@id'
            };
            var _methods = {
                assuntoLido: {
                    method: 'PUT',
                    isArray: false
                },
                enviar: {
                    method: 'POST',
                    isArray: false
                },
                listarAssuntos: {
                    method: 'GET',
                    isArray: true
                },
                listarEmpresasAssuntos: {
                    method: 'GET',
                    isArray: false
                },
                listarMensagens: {
                    method: 'GET',
                    isArray: true
                }
            };

            return $resource(_url, _params, _methods);

        }])
        .factory('AltKooponMensagemModel', ['AltPassaporteUsuarioLogadoManager', function(AltPassaporteUsuarioLogadoManager) {
            var AltKooponMensagemModel = function(msg) {
                this.assunto = undefined;
                this.texto = undefined;
                this.nomeUsuarioPassaporte = undefined;
                this.data = undefined;
                this.anexo = undefined;

                angular.extend(this, msg);
            };

            AltKooponMensagemModel.prototype.isValid = function() {
                var _assuntoOk = angular.isDefined(this.assunto) && !!this.assunto.length;
                var _mensagemOk = angular.isDefined(this.texto) && !!this.texto.length;

                return _assuntoOk && _mensagemOk;
            };

            AltKooponMensagemModel.prototype.msgDoUsuarioLogado = function() {
                return (this.nomeUsuarioPassaporte === AltPassaporteUsuarioLogadoManager.retorna().nomeUsuario);
            };

            return AltKooponMensagemModel;
        }])
        .factory('AltKooponMensagemService', ['$q', 'AltPassaporteUsuarioLogadoManager', 'AltKooponMensagemResource', 'AltKooponMensagemModel', function($q, AltPassaporteUsuarioLogadoManager, AltKooponMensagemResource, AltKooponMensagemModel) {
            var AltKooponMensagemService = function() {

            };

            AltKooponMensagemService.prototype.listarAssuntos = function() {
                return AltKooponMensagemResource
                  .listarAssuntos()
                  .$promise
                  .then(function(mensagens) {
                      return mensagens.map(function(msg) {
                        return new AltKooponMensagemModel(msg);
                      });
                  })
                  .catch(function(erro) {
                    return $q.reject(erro);
                  });
            };

            AltKooponMensagemService.prototype.listarEmpresasAssuntos = function() {
                return AltKooponMensagemResource
                    .listarEmpresasAssuntos()
                    .$promise
                    .then(function(empresas) {
                        var _empresas = [];
                        var _assinantesStorage = AltPassaporteUsuarioLogadoManager.retorna().assinantesEmpresa;

                        for (var prop in empresas) {
                          _assinantesStorage.forEach(function(as) {
                            if (as.id == prop) {
                                _empresas.push({
                                  id: prop,
                                  nome: as.nome,
                                  assuntos: empresas[prop]
                                });
                            }
                          })
                        }

                        return _empresas;
                    })
                    .catch(function(erro) {
                        return $q.reject(erro);
                    });
            };

            AltKooponMensagemService.prototype.listarMensagens = function(id) {
                return AltKooponMensagemResource
                    .listarMensagens({id: id})
                    .$promise
                    .then(function(mensagens) {
                        return mensagens.map(function(msg) {
                            return new AltKooponMensagemModel(msg);
                        });
                    })
                    .catch(function(erro) {
                        return $q.reject(erro);
                    });
            };

            AltKooponMensagemService.prototype.enviar = function(msg, idAssunto) {
                return AltKooponMensagemResource
                    .enviar({id: idAssunto}, msg)
                    .$promise
                    .then(function(mensagemEnviada) {
                        return new AltKooponMensagemModel(mensagemEnviada);
                    })
                    .catch(function(erro) {
                        return $q.reject(erro);
                    });
            };

            AltKooponMensagemService.prototype.assuntoLido = function(idAssunto) {
                return AltKooponMensagemResource
                        .assuntoLido({id: idAssunto})
                        .$promise
                        .then(function() {
                            return;
                        })
                        .catch(function(erro) {
                            return $q.reject(erro);
                        });
            };

            return new AltKooponMensagemService();
        }])
        .controller('AltKooponMensagensController', ['$scope', 'AltKooponMensagemModel', 'AltKooponMensagemService', 'EVENTO_NOVO_ASSUNTO', function($scope, AltKooponMensagemModel, AltKooponMensagemService, EVENTO_NOVO_ASSUNTO) {
            var self = this;

            self.novaMensagem = false;
            self.mensagem = new AltKooponMensagemModel();
            self.assuntos = [];

            self.responder = function(msg, idAssunto) {
                AltKooponMensagemService
                    .enviar(msg, idAssunto)
                    .then(function(msgResposta) {
                        self.assuntos
                            .forEach(function(assunto) {
                                if (assunto.idMensagem === idAssunto) {
                                    assunto.mensagens.push(msgResposta);
                                }
                            });
                    })
                    .catch(function(erro) {

                    });
            };

            self.listarMensagens = function(idAssunto) {
                AltKooponMensagemService
                    .listarMensagens(idAssunto)
                    .then(function(msgs) {
                        self.assuntos
                            .forEach(function(assunto) {
                                if (assunto.idMensagem === idAssunto) {
                                    return assunto.mensagens = msgs;
                                }
                            })

                        return AltKooponMensagemService.assuntoLido(idAssunto);
                    })
                    .catch(function(erro) {

                    });
            };

            ;(function() {
                AltKooponMensagemService
                    .listarAssuntos()
                    .then(function(assuntos) {
                        self.assuntos = assuntos;
                    })
                    .catch(function(erro) {

                    });

                $scope.$on(EVENTO_NOVO_ASSUNTO, function(ev, novoAssunto) {
                    self.assuntos.push(novoAssunto);
                });
            }());
        }])
        .controller('AltKooponEmpresasComMensagensController', ['$scope',  'AltKooponMensagemModel', 'AltKooponMensagemService', 'EVENTO_NOVO_ASSUNTO', function($scope, AltKooponMensagemModel, AltKooponMensagemService, EVENTO_NOVO_ASSUNTO) {
            var self = this;
        }])
        .controller('AltKooponNovaMensagemController', ['$scope', 'AltKooponMensagemModel', 'AltKooponMensagemService',
                                                        'AltModalService', 'AltPassaporteUsuarioLogadoManager', 'ID_MODAL_MENSAGEM',
                                                        'EVENTO_NOVO_ASSUNTO',
                                        function($scope, AltKooponMensagemModel, AltKooponMensagemService,
                                                 AltModalService, AltPassaporteUsuarioLogadoManager, ID_MODAL_MENSAGEM,
                                                 EVENTO_NOVO_ASSUNTO) {
            var self = this;

            self.mensagem = new AltKooponMensagemModel();

            self.enviar = function(msg) {
                AltKooponMensagemService
                    .enviar(msg)
                    .then(function(msgEnviada) {
                        self.mensagem = new AltKooponMensagemModel();

                        $scope.$emit(EVENTO_NOVO_ASSUNTO, msgEnviada);
                        AltModalService.close(ID_MODAL_MENSAGEM);
                    })
                    .catch(function(erro) {

                    });
            };
        }])
        .directive('altKooponMensagemToggle', [function() {
            return function(scope, element, attrs) {
                var mensagensContainer = undefined;

                element.find('.assunto-mensagem').on('click', function() {
                    mensagensContainer = angular.element('.mensagens-container');

                    mensagensContainer.slideUp('fast');
                    element.find(mensagensContainer).slideDown('fast');
                });
            };
        }])
        .directive('altKooponMensagemActive', [function() {
            return function(scope, element, attrs) {
                element.on('click', function() {
                    $('[alt-koopon-mensagem-active]').removeClass('active');
                    element.addClass('active');
                });
            };
        }]);
}());
