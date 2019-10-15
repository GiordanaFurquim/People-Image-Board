const spicedPg = require("spiced-pg");

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbuser, dbpass } = require("../secrets.json");
    db = spicedPg(`postgres:${dbuser}:${dbpass}@localhost:5432/image_board`);
}

////// EXPORTS IMAGES AND FILES///////////

exports.getImages = function() {
    return db.query(`SELECT id, url, username, title, description
        FROM images
        ORDER BY id DESC
        LIMIT 9`);
};

exports.insertFile = function(title, username, description, url) {
    return db
        .query(
            `INSERT INTO images (title, username, description, url)
        VALUES ($1, $2, $3, $4)
        RETURNING * `,
            [title, username, description, url]
        )
        .then(data => {
            return data.rows;
        });
};

exports.getSingleImage = function(id) {
    return db
        .query(
            `SELECT *
        FROM images
        WHERE id = $1`,
            [id]
        )
        .then(data => {
            return data.rows;
        });
};

////// EXPORTS COMMENTS///////////

exports.addComments = function(comment, username, image_id) {
    return db
        .query(
            `
        INSERT INTO comments (comment, username, image_id)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
            [comment, username, image_id]
        )
        .then(data => {
            return data.rows;
        });
};

exports.showComments = function(id) {
    return db
        .query(
            `SELECT * FROM comments
        WHERE image_id = $1
        ORDER BY created_at DESC`,
            [id]
        )
        .then(data => {
            return data.rows;
        });
};

exports.getMoreImages = function(id) {
    return db
        .query(
            `SELECT *, (
                SELECT id
                FROM images
                ORDER BY id ASC
                LIMIT 1
            )
            AS "lowestId"
            FROM images
            WHERE id < $1
            ORDER BY id DESC
            LIMIT 18;`,
            [id]
        )
        .then(data => {
            return data.rows;
        });
};
