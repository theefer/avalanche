define(['avalanche/resource/Resource',
        'avalanche/resource/ObjectClassResource', 'avalanche/resource/CollectionResource',
        'avalanche/data/Store', 'avalanche/data/Object', 'avalanche/data/Collection', 'avalanche/data/Model',
        'knockout',
        'avalanche/compat/bind'],
       function(Resource,
                ObjectClassResource, CollectionResource,
                Store, Objekt, Collection, Model,
                ko) {

  var apiUri = 'http://localhost:4567/api';
  var root = new Resource(apiUri);

  // FIXME: nicer way to define your own Models
  var Task = function() {
    Model.apply(this, arguments)

    this.editing = ko.observable(false);
    this.editing.subscribe(function(editing) {
      if (!editing) {
        console.log("finished editing, save")
        if (this.object) {
          this.object.write()
        }
        // FIXME: object hack, should not be necessary?
      }
    }.bind(this));

    this.data().done.subscribe(function(isDone) {
      console.log("sync toggle done: ", isDone)
      if (this.object) {
        this.object.write();
        // FIXME: object hack, should not be necessary?
      }
    }.bind(this));
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
      console.log("API version: ", version);
      ko.applyBindings({version: version}, document.getElementById('appFooter'));
    });
  });

  // root.follow('tasks').then(function(tasksResource) {
  //   tasksResource = tasksResource.as(ObjectClassResource)
  //   console.log(tasksResource, "should be an ObjectClassResource (follow, as)")
  // });

  // root.follow('tasks', {}, {as: CollectionResource}).then(function(tasksResource) {
  //   console.log(tasksResource, "should be an ObjectClassResource (as flag)")
  // });

  // root.follow('tasks', {}, {as: ObjectClassResource}).then(function(tasksResource) {
  //   console.log(tasksResource, "should be an ObjectClassResource (as flag)")
  // });

  root.follow('tasks', {}, {fetch: true}).then(function(tasksResource) {
    console.log(tasksResource, "should be an ObjectClassResource (fetch flag)")
  });

  root.follow('tasks').then(function(tasksResource) {
    tasksResource = tasksResource.as(ObjectClassResource)
    var tasksStore = new Store(tasksResource, Task);

    tasksResource.follow('all').then(function(allTasksResource) {
      allTasksResource = allTasksResource.as(CollectionResource)
      var allTasksCollection = new Collection(allTasksResource, Task);
      allTasksCollection.readAll().then(function(allTasks) {
        var newTask = ko.observable(null);

        function addTask() {
          var newTaskModel = new Task({done: false, title: ''});

          // FIXME: arg, defaults not here?
          newTaskModel.editing(true);

          var handle = newTaskModel.editing.subscribe(function(editing) {
            if (!editing) {
              console.log("done editing, save to server now", newTaskModel.data())
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

        var mainModel = {tasks: allTasks, newTask: newTask, hasDone: hasDone,
                         allDoneToggle: allDoneToggle,
                         addTask: addTask, removeDone: removeDone};

        ko.applyBindings(mainModel, document.getElementById('main'));
      });
    });


    // Leak Store to be played with from the console
    window.tasksStore = tasksStore

    // showcase single shared model instance:
    tasksStore.getById(1).then(function(taskObject) {
      console.log("first task: ", taskObject, taskObject.model().data().title(), taskObject.model().data().done());
      taskObject.model().data().done.subscribe(function(done) {
        console.log("first task done is now: ", done)
      });
    });
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
