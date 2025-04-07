import Link from "next/link";
import React from "react";

interface BillCarsProps {
  billId?: string;
  billName?: string;
  amount?: number;
  splitBy?: number;
}

export function BillCard({ billId, billName, amount, splitBy }: BillCarsProps) {
  return (
    <div className="rounded-md bg-white p-4">
      <div className="flex flex-col text-black">
        <span>
          <b>Name:</b> {billName}
        </span>
        <span>
          <b>Amount:</b> {amount}
        </span>
        <span>
          <b>Split by:</b> {splitBy}
        </span>
        <div className="w-full">
          {/* <QRCodeCanvas
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        value={`https://${window.location.hostname}/share/${b.PK}`}
        // fgColor="#512da8"
        size={50}
      /> */}
        </div>

        {billId && (
          <Link
            href={`/share/${encodeURIComponent(billId)}`}
            className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
          >
            Share bill
          </Link>
        )}
      </div>
    </div>
  );
}
