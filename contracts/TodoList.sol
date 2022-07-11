pragma solidity ^0.5.0;

contract TodoList {
  uint public taskCount = 0;

  struct Task {
    uint id;
    string content;
    string createdBy;
    string hashCode;
    string sender;
    bool completed;
  }

  mapping(uint => Task) public tasks;

  event TaskCreated(
    uint id,
    string content,
    string createdBy,
    string hashCode,
    string sender,
    bool completed
  );

  event TaskCompleted(
    uint id,
    bool completed
  );

  constructor() public {
    createTask("Check out dappuniversity.com", "hi", "aC00LHaSh", "sender@gmail");
  }

  function createTask(string memory _content, string memory _createdBy, string memory _hashCode, string memory _sender) public {
    taskCount ++;
    tasks[taskCount] = Task(taskCount, _content, _createdBy, _hashCode, _sender, false);
    emit TaskCreated(taskCount, _content, _createdBy, _hashCode, _sender, false);
  }

  function toggleCompleted(uint _id) public {
    Task memory _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;
    emit TaskCompleted(_id, _task.completed);
  }

}
