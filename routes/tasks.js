const express = require("express");
const authMiddleware = require("../middleware/auth");
const Task = require("../models/Task");
const upload = require("../middleware/upload.js"); 

const router = express.Router();

// Middleware to check admin role
// const isAdmin = (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ message: 'Admin access required' });
//   }
//   next();
// };

// POST /api/tasks 
router.post("/", authMiddleware, upload.array('documents', 3), async (req, res) => {
  try {
    const files = req.files || [];
    const documents = files.map(file => ({
      name: file.originalname,
      url: `/upload/${file.filename}`,
      size: file.size,
      type: file.mimetype
    }));

    const assignedTo = req.body.assignedTo && req.body.assignedTo.trim() !== ""
      ? req.body.assignedTo
      : req.user.id;

    const assignedToName = req.body.assignedToName && req.body.assignedToName.trim() !== ""
      ? req.body.assignedToName
      : req.user.name;

    // const task = new Task({
    //   ...req.body,
    //   assignedTo,
    //   assignedToName,
    //   createdBy: req.user.id,
    //   documents
    // });

   // await task.save();

    // ✅ Push the task ID into the creator's tasks array
    // await User.findByIdAndUpdate(req.user.id, {
    //   $push: { tasks: task._id }
    // });

    //res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating task" });
  }
});


// GET /api/tasks - Get tasks based on user role
router.get("/", authMiddleware, async (req, res) => {
  try {
    let query = {};
    
    // Non-admins only see their assigned tasks
    if (req.user.role !== 'admin') {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query).populate("assignedTo", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// DELETE /api/tasks/:id (Admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

// PUT /api/tasks/:id (Admin only)
router.put("/:id", authMiddleware,  async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedTask);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating task" });
  }
});

module.exports = router;
