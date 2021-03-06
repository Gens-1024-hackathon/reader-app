angular
  .module('show', [
    'ui.router',
    'ui.bootstrap'
  ])
  .config(moduleConfig)
  .directive('show', ShowDirective);

function moduleConfig($stateProvider) {

  $stateProvider.state('show', {
    url: '/show',
    templateUrl: 'views/show.html',
    controller: ShowController,
    controllerAs: 'vm'
  });

}

function ShowDirective() {
  return {
    scope: {
      show: '='
    },
    link: function(scope, element) {
      scope.$watch('show', function(newValue) {
        if (newValue) {
          element[0].innerHTML = newValue;
        }
      });
    }
  };
}

/**
 * @ngInject
 */
function ShowController($q) {
  this.$q = $q;
  this.initialize();
}

ShowController.prototype.initialize = function() {
  var $q = this.$q;
  var Book = _model.Book;
  var self = this;
  this.diagram = new _model.Diagram(_model);
  $q
    .when(Book.findAll())
    .then(function(books) {
      self.books = books;
    });
};

ShowController.prototype.toggle = function(book) {

  if (book.state) {
    this.open(book._id);
  } else {
    this.close(book._id);
  }

};

ShowController.prototype.toggleClassify = function(book) {
  this.dom = this.diagram.render(this.classify);
};

ShowController.prototype.open = function(bookId) {
  var $q = this.$q;
  var self = this;
  $q
    .when(this.diagram.open(bookId))
    .then(function() {
      self.dom = self.diagram.render(self.classify);
    });
};

ShowController.prototype.close = function(bookId) {
  var $q = this.$q;
  var self = this;
  $q
    .when(this.diagram.close(bookId))
    .then(function() {
      self.dom = self.diagram.render();
    });
};
