WITH product_sales AS (
    SELECT 
        p."ProductName",
        cat."CategoryName",
        SUM(od."Quantity") AS total_sold,
        SUM(od."UnitPrice" * od."Quantity") AS revenue
    FROM "Products" p
    INNER JOIN "Categories" cat ON p."CategoryID" = cat."CategoryID"
    INNER JOIN "OrderDetails" od ON p."ProductID" = od."ProductID"
    GROUP BY p."ProductName", cat."CategoryName"
),
ranked AS (
    SELECT *,
        RANK() OVER (PARTITION BY "CategoryName" ORDER BY revenue DESC) AS rank
    FROM product_sales
)
SELECT * FROM ranked WHERE rank <= 3
ORDER BY "CategoryName", rank;