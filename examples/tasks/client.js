define(['avalanche/Api', 'avalanche/http/adapters/Reqwest',
        'avalanche/resource/ObjectClassResource', 'avalanche/resource/CollectionResource',
        'avalanche/data/Store', 'avalanche/data/Object', 'avalanche/data/Collection', 'avalanche/data/Model',
        'knockout'],
       function(Api, ReqwestAdapter,
                ObjectClassResource, CollectionResource,
                Store, Objekt, Collection, Model,
                ko) {

  var apiUri = 'http://localhost:4567/api';
  var api = new Api(apiUri, {type: 'json', httpAdapter: ReqwestAdapter});
  api.root().then(function(root) {

  var appModel = {
    version: ko.observable()
  };

  // FIXME: nicer way to define your own Models
  var Task = function() {
    Model.apply(this, arguments)

    this.editing = ko.observable(false);
  }
  Task.prototype = Model.prototype
  Task.prototype.constructor = Task

  Task.prototype.startEdit = function() {
    this.editing(true);
  };
  Task.prototype.finishEdit = function() {
    this.editing(false);
  };


  root.follow('version').then(function(versionResource) {
    versionResource.get().then(function(version) {
      var footer = document.getElementById('appFooter');
      console.log("API version: ", version);
      // TODO: how to sync this, i.e. bind version to the resource after the fact?
      appModel.version(version);
      ko.applyBindings(appModel, footer);
    });
  });

  root.follow('tasks').then(function(tasksResource) {
    var tasksStore = new Store(tasksResource, Task);

    tasksResource.follow('all').then(function(allTasksResource) {
      var allTasksCollection = new Collection(allTasksResource, Task);
      allTasksCollection.readAll().then(function(allTasks) {
        var newTask = ko.observable(null);

        function addTask() {
          var newTaskModel = new Task({done: false, title: ''});

          // FIXME: arg, defaults not here?
          newTaskModel.editing(true);

          // TODO: don't rely on state for signals
          var handle = newTaskModel.editing.subscribe(function(editing) {
            if (!editing) {
              console.log("done editing, save to server now", newTaskModel.data)
              allTasksCollection.append(newTaskModel).then(function() {
                console.log("appending ok!", arguments)
                newTask(null);
                handle.dispose();
              }, function() {
                console.log("appending error!")
                newTaskModel.editing(true)
              });
            }
          });

          newTask(newTaskModel);

          return false;
        }

        function removeDone() {
          var tasks = allTasksCollection.data();
          var doneTasks = tasks.filter(function(t){ return !t.v().done(); });
          allTasksCollection.replace(doneTasks)
        }

        var hasDone = ko.computed(function() {
          var tasks = allTasksCollection.data();
          return tasks.some(function(t){ return t.v().done(); });
        });

        var allDoneToggle = ko.computed(function() {
          var tasks = allTasksCollection.data();
          return tasks.every(function(t){ return t.v().done(); });
        });

        // TODO: write to server when toggle done
        var allTaskViews = ko.computed(function() {
          return allTasks().map(function(t) {
            return {
              editing: t.model().editing,
              saveAndView: function(){
                t.write().then(function() {
                  t.model().finishEdit();
                });
              },
              model: t.model,
              modelData: t.v()
            };
          });
        });

        var mainModel = {tasks: allTaskViews, newTask: newTask, hasDone: hasDone,
                         allDoneToggle: allDoneToggle,
                         addTask: addTask, removeDone: removeDone};

        ko.applyBindings(mainModel, document.getElementById('main'));
      });
    });


    // Leak Store to be played with from the console
    window.tasksStore = tasksStore

    // showcase single shared model instance:
    tasksStore.getById(1).then(function(taskObject) {
      console.log("first task: ", taskObject, taskObject.model().data.title(), taskObject.model().data.done());
      taskObject.model().data.done.subscribe(function(done) {
        console.log("first task done is now: ", done)
      });
    });
  });

  // root.follow('tasks', {}, {as: CollectionResource}).then(function(tasksResource) {
  //   console.log(tasksResource, "should be an ObjectClassResource (as flag)")
  // });

  // root.follow('tasks', {}, {as: ObjectClassResource}).then(function(tasksResource) {
  //   console.log(tasksResource, "should be an ObjectClassResource (as flag)")
  // });

  root.follow('tasks').then(function(tasksResource) {
    console.log(tasksResource, "should be an ObjectClassResource (auto fetch)")
  });

  root.follow('tasks', {}, {lazy: true}).then(function(tasksResource) {
    console.log(tasksResource, "should be a Resource (lazy flag)")
  });

  root.follow('tasks', {}, {lazy: true, as: ObjectClassResource}).then(function(tasksResource) {
    console.log(tasksResource, "should be a ObjectClassResource (lazy flag, as hint)")
  });

// TODO: embedded models or collections in model
//       (embedded entities with uri, type, data?)
//       - task has a list of tags
//         (embedded external coll, vs array of objects)
//       - task has one author
//       - root has core resources embedded in (e.g. version, or tasks)
//       lazy load properties/sub-models via links (e.g. author "avatar")

// TODO: model class in Store/Collection vs infer from data?
// TODO: mediaType for entities? mapped to model classes?

// TODO: on destroy, kill resources and models from cache

// TODO: TaskObject + TaskModel? different concerns?
// TODO: Object() or Model() to expose data directly? merge?

// TODO: Tests !


// TODO: Model as interface, ko.mapping-based one as subclass. or magic in Object, dumb Models?


// TODO: model / resource tracks server version?

// TODO: CollectionResource: range, other ops

// TODO: send Accept header corresponding to expected Resource type
//       recognize http error
//       or fetch to read it

// TODO: avoid singleton caches (what if talking to multiple APIs?)

// TODO: localStorage-backed Store


// TODO: knockout extension
// - obs.subscribeNext(function() {}) => trigger next change only
// - obs.syncTo(otherObs) => computed vs bound to view, who wins?

  });
});
