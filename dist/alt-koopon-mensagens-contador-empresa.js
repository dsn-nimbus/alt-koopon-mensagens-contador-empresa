;(function(ng) {
  "use strict";

  ng.module('alt.koopon.mensagens-contador-empresa', [
      'ngResource',
      'alt.passaporte-usuario-logado',
      'alt.modal-service',
      'alt.carregando-info',
      'alt.koopon.notificacoes'
    ])
    .provider('ALT_KOOPON_URL_BASE_API_MENSAGEM', [function() {
      this.urlBase = '/koopon-rest-api/';

      this.$get = function() {
        return this.urlBase;
      };
    }])
    .constant('ID_MODAL_MENSAGEM', '#modal-nova-mensagem')
    .constant('EVENTO_NOVO_ASSUNTO', 'mensagem:novo-assunto')
    .constant('CHAVE_CLIENTE_ESCOLHIDO', 'cliente_escolhido')
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
        },
        listarMensagensDaEmpresa: {
          method: 'GET',
          isArray: false
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

        ng.extend(this, msg);
      };

      AltKooponMensagemModel.prototype.isValid = function() {
        var _assuntoOk = ng.isDefined(this.assunto) && !!this.assunto.length;
        var _mensagemOk = ng.isDefined(this.texto) && !!this.texto.length;

        return _assuntoOk && _mensagemOk;
      };

      AltKooponMensagemModel.prototype.msgDoUsuarioLogado = function() {
        return (this.nomeUsuarioPassaporte === AltPassaporteUsuarioLogadoManager.retorna().nomeUsuario);
      };

      AltKooponMensagemModel.respostaValida = function(resposta){
        return (ng.isDefined(resposta) && ng.isDefined(resposta.texto) && !!resposta.texto.length);
      };

      return AltKooponMensagemModel;
    }])
    .factory('AltKooponMensagemService', ['$q', 'AltPassaporteUsuarioLogadoManager', 'AltKooponNotificacoesManager', 'AltKooponMensagemResource', 'AltKooponMensagemModel',
      function($q, AltPassaporteUsuarioLogadoManager, AltKooponNotificacoesManager, AltKooponMensagemResource, AltKooponMensagemModel) {
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
            });
        };

        AltKooponMensagemService.prototype.listarEmpresasAssuntos = function(empresas) {
          if (!ng.isArray(empresas)) {
            return $q.reject(new TypeError('Empresas deve ser um array.'));
          }

          return AltKooponMensagemResource
            .listarEmpresasAssuntos()
            .$promise
            .then(function(assuntosPorEmpresa) {
              var _empresasParsed = [];

              for (var prop in assuntosPorEmpresa) {
                empresas.forEach(function(emp) {
                  if (emp.idAssinante == prop) {
                    _empresasParsed.push({
                      id: prop,
                      nome: emp.nome,
                      assuntos: assuntosPorEmpresa[prop]
                    });
                  }
                })
              }

              return _empresasParsed;
            });
        };

        AltKooponMensagemService.prototype.listarMensagens = function(idAssunto, idEmpresa) {
          var _verbo = 'listarMensagens';
          var _params = {id: idAssunto};

          if (ng.isDefined(idEmpresa)) {
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
            });
        };

        AltKooponMensagemService.prototype.listarMensagensDaEmpresa = function(idEmpresa, empresas) {
          if (!ng.isArray(empresas)) {
            return $q.reject(new TypeError('Empresas deve ser um array.'));
          }

          var _verbo = 'listarMensagensDaEmpresa';
          var _params = {idEmpresa: idEmpresa};

          return AltKooponMensagemResource
            [_verbo](_params)
            .$promise
            .then(function(assuntosPorEmpresa) {
              var _empresasParsed = [];

              for (var prop in assuntosPorEmpresa) {
                empresas.forEach(function(emp) {
                  if (emp.idAssinante == prop) {
                    _empresasParsed.push({
                      id: prop,
                      nome: emp.nome,
                      assuntos: assuntosPorEmpresa[prop]
                    });
                  }
                })
              }

              return _empresasParsed;
            });
        };

        AltKooponMensagemService.prototype.enviar = function(msg, idAssunto, idEmpresa) {
          var _verbo = 'enviar';
          var _params = {id: idAssunto};

          if (ng.isDefined(idEmpresa)) {
            _verbo = 'enviarParaEmpresa';
            _params = {id: idAssunto, idEmpresa: idEmpresa};
          }

          return AltKooponMensagemResource
            [_verbo](_params, msg)
            .$promise
            .then(function(mensagemEnviada) {
              var _objStorage = AltKooponNotificacoesManager.retorna();
              var _qtdNotificacoes = _objStorage.qtd ? ++_objStorage.qtd : 1;
              var _ultimaQtdNotificacoes = _objStorage.qtdUltimaReq ? ++_objStorage.qtdUltimaReq : 1;

              AltKooponNotificacoesManager.atualiza('limpa', true);
              AltKooponNotificacoesManager.atualiza('qtd', _qtdNotificacoes);
              AltKooponNotificacoesManager.atualiza('qtdUltimaReq', _ultimaQtdNotificacoes);

              return new AltKooponMensagemModel(mensagemEnviada);
            });
        };

        AltKooponMensagemService.prototype.assuntoLido = function(idAssunto) {
          return AltKooponMensagemResource.assuntoLido({id: idAssunto}).$promise;
        };

        return new AltKooponMensagemService();
      }])
    .controller('AltKooponNovaMensagemController', ['$scope', '$xtorage', 'AltKooponMensagemModel', 'AltKooponMensagemService',
      'AltModalService', 'AltPassaporteUsuarioLogadoManager', 'ID_MODAL_MENSAGEM',
      'EVENTO_NOVO_ASSUNTO', 'CHAVE_CLIENTE_ESCOLHIDO',
      function($scope, $xtorage, AltKooponMensagemModel, AltKooponMensagemService,
               AltModalService, AltPassaporteUsuarioLogadoManager, ID_MODAL_MENSAGEM,
               EVENTO_NOVO_ASSUNTO, CHAVE_CLIENTE_ESCOLHIDO) {
        var self = this;

        self.mensagem = new AltKooponMensagemModel();
        var _emp = $xtorage.getFromLocalStorage(CHAVE_CLIENTE_ESCOLHIDO);
        self.clientes = AltPassaporteUsuarioLogadoManager.retorna().assinantesEmpresa;
        self.mensagem.empresaEscolhida = _emp || null;

        self.zeraInformacoes = function(msgForm){
          self.mensagem = new AltKooponMensagemModel();
          msgForm.$setPristine();
        };

        self.enviar = function(msg, msgForm, idEmpresa) {

          AltKooponMensagemService
            .enviar(msg, undefined, idEmpresa)
            .then(function(msgEnviada) {
              ng.extend(msgEnviada, msg);

              self.mensagem = new AltKooponMensagemModel();
              msgForm.$setPristine();

              $scope.$emit(EVENTO_NOVO_ASSUNTO, msgEnviada);
              AltModalService.close(ID_MODAL_MENSAGEM);
            });
        };
      }])
    .directive('altKooponEnterSubmit', [function() {
      return function(scope, element, attrs) {
        element.find(attrs.seletor).on('keydown', function(ev) {
          if (ev.ctrlKey && (ev.which === 13)) {
            var btn = element.find(attrs.btnSubmit).eq(0);

            if (!btn.attr('disabled')) {
              btn.click();
            }
          }
        });
      }
    }])
    .directive('altKooponMensagemToggle', [function() {
      return function(scope, element, attrs) {
        var mensagensContainer = undefined;
        var elementMsgContainer = undefined;

        element.find('.assunto-mensagem').on('click', function() {

          mensagensContainer = ng.element('.mensagens-container');
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
          if (!element.next('.mensagens-container').eq(0).is(':visible')){
            $('[alt-koopon-mensagem-active]').removeClass('active');
            element.addClass('active');
          }
        });
      };
    }]);
}(window.angular));
