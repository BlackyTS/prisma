-- CreateTable
CREATE TABLE "device" (
    "device_id" INTEGER NOT NULL,
    "device_name" VARCHAR(100),
    "device_description" TEXT,
    "device_availability" BOOLEAN,
    "device_approve" BOOLEAN,
    "device_count" INTEGER,

    CONSTRAINT "device_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "loan_detail" (
    "loan_id" SERIAL NOT NULL,
    "transaction_id" SERIAL NOT NULL,
    "device_id" SERIAL NOT NULL,
    "loan_date" TIMESTAMPTZ(6),
    "location_to_loan" VARCHAR(100),

    CONSTRAINT "loan_detail_pkey" PRIMARY KEY ("loan_id")
);

-- CreateTable
CREATE TABLE "return_detail" (
    "return_id" SERIAL NOT NULL,
    "transaction_id" SERIAL NOT NULL,
    "device_id" SERIAL NOT NULL,
    "return_date" TIMESTAMPTZ(6),
    "location_to_return" VARCHAR(100),

    CONSTRAINT "return_detail_pkey" PRIMARY KEY ("return_id")
);

-- CreateTable
CREATE TABLE "room" (
    "room_id" VARCHAR(100) NOT NULL,
    "device_id" INTEGER,

    CONSTRAINT "room_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "transaction_id" SERIAL NOT NULL,
    "user_id" SERIAL NOT NULL,
    "device_id" SERIAL NOT NULL,
    "loan_id" SERIAL NOT NULL,
    "return_id" SERIAL NOT NULL,
    "loan_date_setting" TIMESTAMPTZ(6),
    "return_date_setting" TIMESTAMPTZ(6),
    "due_date_setting" TIMESTAMPTZ(6),
    "transaction_history" TEXT,
    "transaction_report" TEXT,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "user_firstname" VARCHAR(100),
    "user_lastname" VARCHAR(100),
    "user_email" VARCHAR(100),
    "user_password" VARCHAR(255),
    "user_role" VARCHAR(100),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "loan_detail" ADD CONSTRAINT "loan_device" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loan_detail" ADD CONSTRAINT "loan_transaction" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("transaction_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "return_detail" ADD CONSTRAINT "return_device" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "return_detail" ADD CONSTRAINT "return_transaction" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("transaction_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_device_id" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_device" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_loan" FOREIGN KEY ("loan_id") REFERENCES "loan_detail"("loan_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_return" FOREIGN KEY ("return_id") REFERENCES "return_detail"("return_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
