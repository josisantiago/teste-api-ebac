/// <reference types="cypress" />
import contrato from '../contracts/usuarios.contrato'

describe('Testes da Funcionalidade Usuários', () => {
  let token
  beforeEach(() => {
    cy.token('fulano@qa.com', 'teste').then(tkn => {
      token = tkn
    })
  });

  it('Deve validar contrato de usuários', () => {
    cy.request('usuarios').then(response => {
      return contrato.validateAsync(response.body)
    })
  });

  it('Deve listar usuários cadastrados', () => {
    cy.request({
      method: 'GET',
      url: 'usuarios'
    }).should((response) => {
      expect(response.status).equal(200)
      expect(response.body).to.have.property('usuarios')
    })
  });

  it('Deve cadastrar um usuário com sucesso', () => {
    let usuario = 'Usuario EBAC ' + Math.floor(Math.random() * 100000000000)
    let email = `usuarios${Math.floor(Math.random() * 1000)}@exemplo.com`
    
    cy.cadastrarUsuario(token, usuario, email, 'teste', 'true')
      .should((response) => {
        expect(response.status).equal(201)
        expect(response.body.message).equal("Cadastro realizado com sucesso")
      })
  });

  it('Deve validar um usuário com email inválido', () => {
    let usuario = 'Usuario EBAC ' + Math.floor(Math.random() * 100000000000)

    cy.cadastrarUsuario(token, usuario, 'josianesborrego@gmail.com', 'teste', 'true')
      .should((response) => {
        expect(response.status).equal(400)
        expect(response.body.message).equal("Este email já está sendo usado")
      })
  });

  it('Deve editar um usuário previamente cadastrado', () => {
    let usuario = 'Usuario EBAC Editado ' + Math.floor(Math.random() * 100000000000)
    let email = `usuarios${Math.floor(Math.random() * 1000)}@exemplo.com`
    cy.cadastrarUsuario(token, 'Usuario EBAC editado ', email, 'teste', 'true')
      .then(response => {
        let id = response.body._id

        cy.request({
          method: 'PUT',
          url: `usuarios/${id}`,
          headers: { authorization: token },
          body: {
            "nome": usuario,
            "email": email,
            "password": "teste",
            "administrador": "true"
          }
        }).should(response => {
          expect(response.body.message).to.equal("Registro alterado com sucesso")
          expect(response.status).to.equal(200)
        })
      })
  });

  it('Deve deletar um usuário previamente cadastrado', () => {
    let usuario = 'Usuario EBAC deletado ' + Math.floor(Math.random() * 100000000000)
    let email = `usuarios${Math.floor(Math.random() * 1000)}@exemplo.com`

    cy.cadastrarUsuario(token, 'Usuario EBAC deletado', email, 'teste', 'true')
      .then(response => {
        let id = response.body._id
        cy.request({
          method: 'DELETE',
          url: `usuarios/${id}`,
          headers: { authorization: token },
          body: {
            "nome": usuario,
            "email": email,
            "password": "teste",
            "administrador": "true"
          }
        }).should(response => {
          expect(response.body.message).to.equal("Registro excluído com sucesso")
          expect(response.status).to.equal(200)
        })
      }) 
  });
});
