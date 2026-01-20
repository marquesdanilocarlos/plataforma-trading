Objetivo: Implementar uma tela para criar uma conta

* Implemente dentro de @frontend/react/src/App.jsx e não crie nenhum outro componente
* A tela deve conter 4 campos de entrada: name, email, document, password
* Os campos devem ser posicionados um embaixo do outro e não devem ser obrigatórios
* Cada campo deve ter uma "class", seguindo o padrão do nome do elemento, por exemplo: "input- ou button- ou span-"
* Deve existir um botão com a class button-signup que ao ser clicado invoca a função handleSignup
* A função handleSignup deve chamar o endpoint http://localhost:3000/signup POST passando no payload da request um JSON contendo os campos name, email, document, password. Após a chamada, será retornado um payload JSON contendo accountId, caso exista accountId, um elemento span com class span-message deve exibir o texto "success". Caso o retorno seja 422 e não tenha accountId, deve ser renderizada a propriedade "message" do payload.
* Use um useState para cada campo, não crie form
* Não trate loading
* Não instale bibliotecas externas

Se tiver dúvidas, pergunte
