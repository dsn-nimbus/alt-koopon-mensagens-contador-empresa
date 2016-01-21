;(function() {
    "use strict";

    angular
        .module('alt.koopon.mensagens-contador-empresa', [
            'ngResource',
            'alt.passaporte-usuario-logado',
            'alt.modal-service',
            'alt.carregando-info'
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
            var _url = ALT_KOOPON_URL_BASE_API_MENSAGEM + 'mensagens/:id/:clientes/:idEmpresa';
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
                enviarParaEmpresa: {
                    method: 'POST',
                    isArray: false,
                    params: {
                      clientes: 'clientes'
                    }
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
                },
                listarMensagensParaEmpresa: {
                    method: 'GET',
                    isArray: true,
                    params: {
                      clientes: 'clientes'
                    }
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

            AltKooponMensagemModel.respostaValida = function(resposta){
                return (angular.isDefined(resposta) && angular.isDefined(resposta.texto) && !!resposta.texto.length);
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

            AltKooponMensagemService.prototype.listarMensagens = function(idAssunto, idEmpresa) {
                var _verbo = 'listarMensagens';
                var _params = {id: idAssunto};

                if (angular.isDefined(idEmpresa)) {
                  _verbo = 'listarMensagensParaEmpresa';
                  _params = {id: idAssunto, idEmpresa: idEmpresa};
                }

                return AltKooponMensagemResource
                    [_verbo](_params)
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

            AltKooponMensagemService.prototype.enviar = function(msg, idAssunto, idEmpresa) {
                var _verbo = 'enviar';
                var _params = {id: idAssunto};

                if (angular.isDefined(idEmpresa)) {
                  _verbo = 'enviarParaEmpresa';
                  _params = {id: idAssunto, idEmpresa: idEmpresa};
                }

                return AltKooponMensagemResource
                    [_verbo](_params, msg)
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
        .controller('AltKooponMensagensController', ['$scope', 'AltKooponMensagemModel', 'AltKooponMensagemService', 'AltCarregandoInfoService', 'EVENTO_NOVO_ASSUNTO',
        function($scope, AltKooponMensagemModel, AltKooponMensagemService, AltCarregandoInfoService, EVENTO_NOVO_ASSUNTO) {
            var self = this;

            self.novaMensagem = false;
			self.AltKooponMensagemModel = AltKooponMensagemModel;
            self.mensagem = new AltKooponMensagemModel();
            self.assuntos = [];

            self.responder = function(msg, idAssunto) {
                AltKooponMensagemService
                    .enviar(msg, idAssunto)
                    .then(function(msgResposta) {
                        self.assuntos
                            .forEach(function(assunto) {
                                if (assunto.idMensagem === idAssunto) {
									self.mensagem = "";
                                    return assunto.mensagens.push(msgResposta);
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
                AltCarregandoInfoService.exibe();

                AltKooponMensagemService
                    .listarAssuntos()
                    .then(function(assuntos) {
                        self.assuntos = assuntos;
                    })
                    .catch(function(erro) {

                    })
                    .finally(function() {
                      AltCarregandoInfoService.esconde();
                    });

                $scope.$on(EVENTO_NOVO_ASSUNTO, function(ev, novoAssunto) {
                    self.assuntos.push(novoAssunto);
                });
            }());
        }])
        .controller('AltKooponEmpresasComMensagensController', ['$scope',  'AltKooponMensagemModel', 'AltKooponMensagemService', 'AltCarregandoInfoService', 'EVENTO_NOVO_ASSUNTO',
        function($scope, AltKooponMensagemModel, AltKooponMensagemService, AltCarregandoInfoService, EVENTO_NOVO_ASSUNTO) {
            var self = this;

			self.AltKooponMensagemModel = AltKooponMensagemModel;
            self.empresas = [];

            self.listarMensagens = function(idEmpresa, idAssunto) {
                AltKooponMensagemService
                  .listarMensagens(idAssunto, idEmpresa)
                  .then(function(msgs) {
                    self.empresas.forEach(function(emp) {
                      if (emp.id === idEmpresa) {
                          emp.assuntos.forEach(function(assunto) {
                              if (assunto.idMensagem === idAssunto) {
                                return assunto.mensagens = msgs;
                              }
                          })
                      }
                    });
                  })
                  .catch(function() {

                  });
            };

            self.responder = function(msg, idEmpresa, idAssunto) {
                AltKooponMensagemService
                  .enviar(msg, idAssunto, idEmpresa)
                  .then(function(msgEnviada) {
                    self.empresas.forEach(function(emp) {
                      if (emp.id === idEmpresa) {
                        emp.assuntos.forEach(function(assunto) {
                          if (assunto.idMensagem === idAssunto) {
                            return assunto.mensagens.push(msgEnviada);
                          }
                        })
                      }
                    })
                  })
                  .catch(function() {

                  });
            };

            ;(function() {
              AltCarregandoInfoService.exibe();

              AltKooponMensagemService
                .listarEmpresasAssuntos()
                .then(function(empresasComAssuntos) {
                  self.empresas = empresasComAssuntos;
                })
                .catch(function(erro) {

                })
                .finally(function() {
                    AltCarregandoInfoService.esconde();
                });

              $scope.$on(EVENTO_NOVO_ASSUNTO, function(ev, novoAssunto) {
                self.empresas.forEach(function(emp) {
                  if (emp.id == novoAssunto.empresaEscolhida) {
                      return emp.assuntos.push(novoAssunto);
                  }
                });
              });
            }());
        }])
        .controller('AltKooponNovaMensagemController', ['$scope', 'AltKooponMensagemModel', 'AltKooponMensagemService',
                                                        'AltModalService', 'AltPassaporteUsuarioLogadoManager', 'ID_MODAL_MENSAGEM',
                                                        'EVENTO_NOVO_ASSUNTO',
                                        function($scope, AltKooponMensagemModel, AltKooponMensagemService,
                                                 AltModalService, AltPassaporteUsuarioLogadoManager, ID_MODAL_MENSAGEM,
                                                 EVENTO_NOVO_ASSUNTO) {
            var self = this;

            self.mensagem = new AltKooponMensagemModel();
            self.clientes = AltPassaporteUsuarioLogadoManager.retorna().assinantesEmpresa;

            self.enviar = function(msg, idEmpresa) {
                AltKooponMensagemService
                    .enviar(msg, undefined, idEmpresa)
                    .then(function(msgEnviada) {
                        angular.extend(msgEnviada, msg);

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
                var elementMsgContainer = undefined;
				
                element.find('.assunto-mensagem').on('click', function() {
					
                    mensagensContainer = angular.element('.mensagens-container');
                    elementMsgContainer = element.find('.mensagens-container');
					
					if (elementMsgContainer.is(':visible')) {
						
                        elementMsgContainer.slideUp('fast');
                        return;
                    }

                    mensagensContainer.slideUp('fast');
                    elementMsgContainer.slideDown('fast');
                });
            };
        }])
        .directive('altKooponMensagemActive', [function() {
            return function(scope, element, attrs) {
                element.on('click', function() {
					
					if (element.hasClass('active')){
                        element.removeClass('active');
                        return;
                    }
					
                    $('[alt-koopon-mensagem-active]').removeClass('active');
                    element.addClass('active');
                });
            };
        }]);
}());
