-- CreateTable
CREATE TABLE "Categories" (
    "CategoryID" SERIAL NOT NULL,
    "CategoryName" VARCHAR(15) NOT NULL,
    "Description" TEXT,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("CategoryID")
);

-- CreateTable
CREATE TABLE "Customers" (
    "CustomerID" VARCHAR(5) NOT NULL,
    "CompanyName" VARCHAR(40) NOT NULL,
    "ContactName" VARCHAR(30),
    "ContactTitle" VARCHAR(30),
    "Address" VARCHAR(60),
    "City" VARCHAR(15),
    "Region" VARCHAR(15),
    "PostalCode" VARCHAR(10),
    "Country" VARCHAR(15),
    "Phone" VARCHAR(24),
    "Fax" VARCHAR(24),

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("CustomerID")
);

-- CreateTable
CREATE TABLE "Employees" (
    "EmployeeID" SERIAL NOT NULL,
    "LastName" VARCHAR(20) NOT NULL,
    "FirstName" VARCHAR(10) NOT NULL,
    "Title" VARCHAR(30),
    "TitleOfCourtesy" VARCHAR(25),
    "BirthDate" TIMESTAMP(6),
    "HireDate" TIMESTAMP(6),
    "Address" VARCHAR(60),
    "City" VARCHAR(15),
    "Region" VARCHAR(15),
    "PostalCode" VARCHAR(10),
    "Country" VARCHAR(15),
    "HomePhone" VARCHAR(24),
    "Extension" VARCHAR(4),
    "Notes" TEXT,
    "ReportsTo" INTEGER,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("EmployeeID")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "SupplierID" SERIAL NOT NULL,
    "CompanyName" VARCHAR(40) NOT NULL,
    "ContactName" VARCHAR(30),
    "ContactTitle" VARCHAR(30),
    "Address" VARCHAR(60),
    "City" VARCHAR(15),
    "Region" VARCHAR(15),
    "PostalCode" VARCHAR(10),
    "Country" VARCHAR(15),
    "Phone" VARCHAR(24),
    "Fax" VARCHAR(24),

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("SupplierID")
);

-- CreateTable
CREATE TABLE "Shippers" (
    "ShipperID" SERIAL NOT NULL,
    "CompanyName" VARCHAR(40) NOT NULL,
    "Phone" VARCHAR(24),

    CONSTRAINT "Shippers_pkey" PRIMARY KEY ("ShipperID")
);

-- CreateTable
CREATE TABLE "Products" (
    "ProductID" SERIAL NOT NULL,
    "ProductName" VARCHAR(40) NOT NULL,
    "SupplierID" INTEGER,
    "CategoryID" INTEGER,
    "QuantityPerUnit" VARCHAR(20),
    "UnitPrice" DECIMAL(19,4) DEFAULT 0,
    "UnitsInStock" INTEGER DEFAULT 0,
    "UnitsOnOrder" INTEGER DEFAULT 0,
    "ReorderLevel" INTEGER DEFAULT 0,
    "Discontinued" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("ProductID")
);

-- CreateTable
CREATE TABLE "Orders" (
    "OrderID" SERIAL NOT NULL,
    "CustomerID" VARCHAR(5),
    "EmployeeID" INTEGER,
    "OrderDate" TIMESTAMP(6),
    "RequiredDate" TIMESTAMP(6),
    "ShippedDate" TIMESTAMP(6),
    "ShipVia" INTEGER,
    "Freight" DECIMAL(19,4) DEFAULT 0,
    "ShipName" VARCHAR(40),
    "ShipAddress" VARCHAR(60),
    "ShipCity" VARCHAR(15),
    "ShipRegion" VARCHAR(15),
    "ShipPostalCode" VARCHAR(10),
    "ShipCountry" VARCHAR(15),

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("OrderID")
);

-- CreateTable
CREATE TABLE "OrderDetails" (
    "OrderID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "Quantity" INTEGER NOT NULL DEFAULT 1,
    "Discount" REAL NOT NULL DEFAULT 0,

    CONSTRAINT "OrderDetails_pkey" PRIMARY KEY ("OrderID","ProductID")
);

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_SupplierID_fkey" FOREIGN KEY ("SupplierID") REFERENCES "Suppliers"("SupplierID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_CategoryID_fkey" FOREIGN KEY ("CategoryID") REFERENCES "Categories"("CategoryID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("CustomerID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employees"("EmployeeID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_ShipVia_fkey" FOREIGN KEY ("ShipVia") REFERENCES "Shippers"("ShipperID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_OrderID_fkey" FOREIGN KEY ("OrderID") REFERENCES "Orders"("OrderID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ProductID") ON DELETE RESTRICT ON UPDATE CASCADE;
