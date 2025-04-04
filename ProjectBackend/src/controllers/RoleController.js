const roleModel = require("../models/RoleModel");




const addRoles = async (req, res) => {
  try {
    const savedRoles = await roleModel.create(req.body);
    res.status(201).json({
      message: "Role added successfully",
      data: savedRoles,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllRole = async (req, res) => {
  try {
    const savedRole= await roleModel.find();
    res.status(201).json({
      message: "Role added successfully",
      data: savedRole,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteRole = async(req,res)=>{

    

    const deletedRole = await roleModel.findByIdAndDelete(req.params.id)

    res.json({
      message:"role deleted successfully..",
      data:deletedRole
    })



}

const getRoleById = async (req,res)=>{

  const foundRole = await roleModel.findById(req.params.id)
  res.json({
    message:"role fatched..",
    data:foundRole
  })

}


module.exports = {
  getAllRole,addRoles,deleteRole,getRoleById
};