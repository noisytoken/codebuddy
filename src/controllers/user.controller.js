const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;

    const skip = (page - 1) * limit;
    const total = await User.countDocuments();
    const users = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          posts: {
            $size: "$posts",
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      data: {
        users: users,
        pagination: {
          totalDocs: total,
          limit,
          page,
          totalPages,
          pagingCounter: (page - 1) * limit + 1,
          hasPrevPage: page >= 2,
          hasNextPage: page < totalPages,
          prevPage: page >= 2 ? page - 1 : null,
          nextPage: page < totalPages ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};
