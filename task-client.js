define([//'resource/Resource', 'resource/ObjectResource',
        //'resource/ObjectClassResource', 'resource/CollectionResource',
        'resource/Resource',
        'resource/ObjectClassResource', 'resource/CollectionResource',
        'data/Store', 'data/Model', 'data/Collection',
        'knockout',
        'compat/bind'],
       function(//HttpJqueryAdapter, Http,
                //Resource, ObjectResource,
                //ObjectClassResource, CollectionResource,
                Resource,
                ObjectClassResource, CollectionResource,
                Store, Model, Collection,
                ko) {

  var apiUri = 'http://localhost:4567/api';
  var root = new Resource(apiUri);

  // FIXME: nicer way to define your own Models
  var Task = function(resource) {
    Model.apply(this, arguments)

    this.editing = ko.observable(false);
    this.editing.subscribe(function(editing) {
      if (!editing) {
        console.log("finished editing, save")
        if (this.resource) {
          this.write()
        }
        // FIXME: hack, should not be necessary!
      }
    }.bind(this));

    this.data().done.subscribe(function(isDone) {
      console.log("sync toggle done: ", isDone)
      this.write();
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
    console.log("Tasks store", tasksStore);

    // Leak Store to be played with from the console
    window.tasksStore = tasksStore

    tasksStore.getById(1).then(function(taskModel) {
      console.log("first task: ", taskModel, taskModel.data().title(), taskModel.data().done());
      // showcase single shared model instance:
      taskModel.data().done.subscribe(function(done) {
        console.log("first task done is now: ", done)
      });
    });

    tasksResource.follow('all').then(function(allTasksResource) {
      allTasksResource = allTasksResource.as(CollectionResource)
      var allTasksCollection = new Collection(allTasksResource, Task);
      allTasksCollection.readAll().then(function(allTasks) {
        var newTask = ko.observable(null);

        function addTask() {
          // var newTaskModel = new Task
          // // FIXME: construct Model without Resource backing?
          // newTaskModel.data({done: ko.observable(false), title: ko.observable('')})

          var newTaskModel = new Task(null, {done: ko.observable(false), title: ko.observable('')})
          // FIXME: arg, defaults not here?
          newTaskModel.editing(true);
          newTask(newTaskModel);

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
          return false;
        }

        function removeDone() {
          var tasks = allTasksCollection.data();
          var doneTasks = tasks.filter(function(t){ return !t.data().done(); });
          allTasksCollection.replace(doneTasks)
        }

        var hasDone = ko.computed(function() {
          var tasks = allTasksCollection.data();
          return tasks.some(function(t){ return t.data().done(); });
        });

        var allDoneToggle = ko.computed(function() {
          var tasks = allTasksCollection.data();
          return tasks.every(function(t){ return t.data().done(); });
        });

        var mainModel = {tasks: allTasks, newTask: newTask, hasDone: hasDone,
                         allDoneToggle: allDoneToggle,
                         addTask: addTask, removeDone: removeDone};

        ko.applyBindings(mainModel, document.getElementById('main'));
      });
    });
  });

// TODO: model with resource vs only data (detached)
// TODO: model class in Store/Collection vs infer from data?

// TODO: model / resource tracks server version?

// TODO: embedded models or collections in model
//       (embedded entities with uri, type, data?)

// TODO: mediaType for entities? mapped to model classes?

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
