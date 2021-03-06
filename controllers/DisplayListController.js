/**
* Created by jiaoxiangyu on 15/10/24.
*/
angular
  .module('app')
  .controller('DisplayListController', DisplayListController);

//@ngInject
function DisplayListController($q, $state) {

  var myScope = this;
  var book = _model.Book;
  var eventGroup = _model.EventGroup;

  function initialize(){
    myScope.events = [];
    $q.when(book.findAll())
      .then(function(result) {
        console.log(result);
        myScope.books = result;
        var bk = {};
        if($state.params.id != ''){
          $q.when(book.findById($state.params.id))
            .then(function(result){
              bk = result;
              myScope.getEventList(bk);
            });
        }else if(!!myScope.books && myScope.books.length != 0) {
          $q.when(book.findById(myScope.books[0]._id))
            .then(function (result) {
              bk = result;
              myScope.getEventList(bk);
            })
        }
      })
  }

  this.changeBook = function(book){
    console.log(book);
    $state.go('displayList',{id:book._id},{reload:true});
    myScope.getEventList(book);
  };

  //todo get Book List
  this.getBookList = function(){
    $q.when(book.findAll())
    .then(function(result){
      console.log(result);
      myScope.books = result;
    })
  };

  //todo get event List By BookId
  this.getEventList = function(book){
    $q.when(book.getEventGroups())
    .then(function(results){
      console.log(results);
      myScope.events = results;
    })
  };

  this.editBook = function(book){
    $state.go('bookScanner',{edit:book._id},{reload:true})
  };

  this.deleteBook = function(bo){
    $q.when(book.findById(bo._id)).then(function(book){
      return book.destroy();
    }).then(function() {
      initialize();
    })
  };

  this.editEvent = function(event){
    var selectedBook = {};
    if($state.params.id === ''){
      $q.when(book.findById(myScope.books[0]._id))
      .then(function(result){
        console.log(result);
        selectedBook = result;
        $state.go('eventScanner',{edit:event._id,id:selectedBook._id,title:selectedBook.title},{reload:true});
      })
    }else{
      $q.when(book.findById($state.params.id))
      .then(function(result){
        console.log(result);
        selectedBook = result;
        $state.go('eventScanner',{edit:event._id,id:selectedBook._id,title:selectedBook.title},{reload:true});
      })
    }
  };

  this.deleteEvent = function(event){
    $q.when(eventGroup.findById(event._id))
    .then(function(result){
      console.log(result);
      $q.when(result.destroy())
      .then(function(result){
        console.log(result);
        initialize();
        //$state.go('displayList',{id:$stat},{reload:true});
      })
    })
  };

  /**
  *  jump to Book Scanner
  */
  this.visitBookScanner = function(){
    $state.go('bookScanner',{},{reload:true});
  };

  //todo jump to Event Scanner
  this.visitEventScanner = function(book){
    $state.go('eventScanner',{id:book._id,title:book.title},{reload:true})
  };

  this.upload = function(file) {

    var reader = new FileReader();
    reader.onload = function(evt) {
      var data = JSON.parse(evt.target.result);
      importData(data)
        .then(function() {
          window.location.reload();
        });
    };
    reader.readAsText(file);

  };

  this.judgeTitle = function(books,title){
    var id = '';
    books.forEach(function(item){
      console.log(item);
      if(item.title === title){
        id = item._id;
      }
    });
    return id;
  };

  //this.batchInsert = function(MsgArray) {
  //    console.log(MsgArray);
  //    var a = Object.keys(MsgArray.reduce(function(memo,item){
  //        memo[item.tags[0]] = true;
  //        return memo;
  //    },{}));
  //    $q.all(a.map(function(data){
  //        return book.create({
  //                type: 'book',
  //                title: data,
  //                author: '网络来源'
  //            })
  //        }))
  //        .then(function(books){
  //            angular.forEach(MsgArray,function(item){
  //                var bookId = myScope.judgeTitle(books,item.tags[0]);
  //                $q.when(eventGroup.create({
  //                    bookId: bookId,
  //                    description: item.description,
  //                    anchor: [
  //                        {
  //                            value: moment.unix(item.time.start.start).year()
  //                        },
  //                        {
  //                            value: moment.unix(item.time.end.end).year()
  //                        }
  //                    ]
  //                }))
  //                    .then(function(result){
  //                        console.log(result);
  //                    })
  //            })
  //        });
  //};

  initialize();
  return;

  function importData(data) {

    var Book = _model.Book;
    var EventGroup = _model.EventGroup;

    var titles = Object.keys(data.reduce(function(memo, item) {
      // console.log(item.tags);
      memo[item.tags[0]] = true;
      return memo;
    }, {}));

    return $q
      .all(titles.map(function(title) {
        return Book.create({
          title: title,
          author: '匿名'
        });
      }))
      .then(function(books) {
        var indexed = books.reduce(function(memo, book) {
          memo[book.title] = book._id;
          return memo;
        }, {});
        var tasks = data.map(function(item) {
          return EventGroup.create({
            bookId: indexed[item.tags[0]],
            description: item.description,
            anchor: [
              {value: moment.unix(item.time.start.start).year()},
              {value: moment.unix(item.time.end.end).year()}
            ]
          });
        });
        return $q.all(tasks);
      });

    console.log(titles);

  }

}
