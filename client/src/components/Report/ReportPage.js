import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ReportPage.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Mặc định sẵn
import * as XLSX from 'xlsx'; // Import thư viện XLSX

function BatchPage() {
    const [report, setReport] = useState([]);
    const [editId, setEditId] = useState('');
    const [editRevenue, setEditRevenue] = useState(0);
    const [showTable, setShowTable] = useState(false);
    const [batchId, setBatchId] = useState(null);
    const [newestBatch, setNewestBatch] = useState(null);
    const [fromBatch, setFromBatch] = useState(''); 
    const [toBatch, setToBatch] = useState('');
    const [fromDateBatch, setFromDateBatch] = useState('');
    const [toDateBatch, setToDateBatch] = useState('');
    const [statistic, setStatistic] = useState([]);
    const [batchNumber, setBatchNumber] = useState(0);
    const [queryByDate, setQueryByDate] = useState(false);

    useEffect(() => {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0]; // Lấy ngày theo định dạng YYYY-MM-DD
        setFromDateBatch(formattedDate);
        setToDateBatch(formattedDate);

        axios.get('http://localhost:3012/batch/getNewestBatch')
            .then(response => {
                const { batch } = response.data;
                if (batch !== null) {
                    setNewestBatch(batch);
                    setBatchId(batch._id);
                } else {
                    setNewestBatch(null);
                    setBatchId(null);
                }
            })
            .catch(error => {
                console.error('Error fetching newest batch data:', error);
            });
    }, []); 
    
    useEffect(() => {
        if (newestBatch !== null) {
            const request = {
                from: 1,
                to: newestBatch.batchNumber - (1 - newestBatch.isSave),
            }
            axios.post('http://localhost:3012/batch/getBatches', request)
            .then(response => {
                const { batches } = response.data;
                setStatistic(batches);
            })
            .catch(error => {
                console.error('Error fetching batches data:', error);
            });
            if(!newestBatch.isSave) {
                axios.get('http://localhost:3012/sale')
                .then(response => {
                    const { report } = response.data;
                    setReport(report);
                })
                .catch(error => {
                    console.error('Error fetching sales data:', error);
                });
                setShowTable(true);
                setBatchNumber(newestBatch.batchNumber - 1);
            } else {
                setFromBatch('');
                setToBatch('');
                setBatchNumber(newestBatch.batchNumber)
                setShowTable(false);
            }    
        } else {
            setShowTable(false);
        }
    }, [newestBatch]); 
    

    const handleRevenueChange = (e) => {
        const value = e.target.value;
        if (value >= 0) setEditRevenue(value);
        else setEditRevenue(0);
    };

    const handleBeforeUpdate = (saleId, revenue) => {
        setEditId(saleId);
        setEditRevenue(revenue);
    };

    const handleUpdate = () => {
        const saleData = { revenue: editRevenue };
        axios.patch(`http://localhost:3012/sale/${editId}`, saleData)
        .then(response => {
            const { message } = response.data;
            toast.success(message);
            axios.get('http://localhost:3012/sale')
            .then(response => {
                const { report } = response.data;
                setReport(report);
            })
            .catch(error => {
                console.error('Error fetching sale data:', error);
            });
        })
        .catch(error => {
            const { message } = error.response.data;
            toast.error(message);
            console.error('Error fetching sale data:', error);
        });
        setEditId('');
        setEditRevenue(0);
    };

    const handleCreateTable = () => {
        axios.post('http://localhost:3012/batch/create')
        .then(response => {
            const { message, batch } = response.data;
            setBatchId(batch._id);
            setNewestBatch(batch);
            toast.success(message);
        })
        .catch(error => {
            console.error('Error creating batch table', error);
        });
        setShowTable(true)
    }

    const handleSaveTable = () => {
        axios.patch(`http://localhost:3012/batch/save/${batchId}`)
        .then(response => {
            const { message, batch } = response.data;
            toast.success(message);
            setStatistic(prevStatistic => [
                batch,
                ...prevStatistic,
            ]);
            setFromBatch('');
            setToBatch('');
            setBatchNumber(batchNumber + 1);
        })
        .catch(error => {
            console.error('Error creating batch table', error);
        });
        setShowTable(false)
    }

    const handleDeleteTable = () => {
        axios.delete(`http://localhost:3012/batch/${batchId}`)
        .then(response => {
            const { message } = response.data;
            setFromBatch('');
            setToBatch('');
            toast.success(message);
        })
        .catch(error => {
            console.error('Error creating batch table', error);
        });
        setShowTable(false)
    } 

    const handleFromChange = (e) => {
        const value = e.target.value;
        if(queryByDate) {
            setFromDateBatch(value);
        } else {
            if (value > batchNumber) {
                setFromBatch(batchNumber);
            } else {
                if (value >= 0) setFromBatch(value);
                else setFromBatch(0);
            }
        }   
    }

    const handleToChange = (e) => {
        const value = e.target.value;
        if(queryByDate) {
            setToDateBatch(value);
        } else {
            if (value > batchNumber) {
                setToBatch(batchNumber);
            } else {
                if (value >= 0) setToBatch(value);
                else setToBatch(0);
            }
        }   
    }

    const handleGetBatches = () => {
        const request = {
            from: (queryByDate ? fromDateBatch : fromBatch),
            to: (queryByDate ? toDateBatch : toBatch),
        }
        axios.post(`http://localhost:3012/batch/${queryByDate ? 'getBatchesByDate' : 'getBatches'}`, request)
        .then(response => {
            const { message, batches } = response.data;
            toast.success(message);
            setStatistic(batches);
        })
        .catch(error => {
            console.error('Error getting batches report', error);
            const { message } = error.response.data;
            toast.error(message);
        });
    }

    const handleChangeQueryType = () => {
        setQueryByDate(1 - queryByDate);
    }

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const header = [
            'Đợt', 'Nhà phân phối', 'Nhóm', 'Cấp bậc', 'Cấp trên', 
            'Cấp dưới 1', 'Cấp dưới 2', 'Doanh thu', 'Hoa hồng từ doanh thu', 
            'Hoa hồng từ cấp dưới', 'Tổng số'
        ];

        const rows = [];
        const merges = [];
        let currentRow = 1;

        statistic.forEach(batch => {
            batch.saleList.forEach((item, index) => {
                rows.push([
                    batch.batchNumber,
                    item.distributorName,
                    item.groupNo,
                    item.level,
                    item.parentName,
                    item.children.length > 0 ? item.children[0].childrenName : '',
                    item.children.length > 1 ? item.children[1].childrenName : '',
                    item.revenue,
                    item.commissionFromRevenue,
                    item.commissionFromChildren,
                    item.totalIncome,
                ]);

                if (index === 0) {
                    merges.push({
                        s: { r: currentRow, c: 0 }, // Start Row, Column for "Đợt"
                        e: { r: currentRow + batch.saleList.length - 1, c: 0 } // End Row for "Đợt"
                    });
                }

                currentRow++;
            });
        });

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

        ws['!cols'] = [
            { wpx: 30 }, // Đợt
            { wpx: 120 },  // Nhà phân phối
            { wpx: 90 },  // Nhóm
            { wpx: 70 },   // Cấp bậc
            { wpx: 100 }, // Cấp trên
            { wpx: 100 },  // Nhà phân phối cấp dưới 1
            { wpx: 100 },  // Nhà phân phối cấp dưới 2
            { wpx: 100 },  // Doanh thu
            { wpx: 140 },  // Hoa hồng từ doanh thu
            { wpx: 140 },  // Hoa hồng từ cấp dưới
            { wpx: 100 },  // Tổng số
        ];

        ws['!merges'] = merges; // Thêm merge vào worksheet

        XLSX.utils.book_append_sheet(wb, ws, 'Statistic');
        XLSX.writeFile(wb, 'Báo cáo thống kê.xlsx');
    };


    return (
        <div className="report-container">
            <h1>Thống kê doanh số theo từng đợt</h1>
            <div className="report-btn">
                { showTable && (<button className="delete-table-btn" onClick={handleDeleteTable}> Hủy bảng thống kê </button> )}
                { showTable && (<button className="save-table-btn" onClick={handleSaveTable}> Lưu bảng thống kê </button> )}
                { !showTable && (<button className="create-table-btn" onClick={handleCreateTable}> Tạo bảng thống kê mới </button> )}
                { !showTable && (<button className="export-btn" onClick={exportToExcel}>Xuất Excel</button> )}
            </div>
            { !showTable ?
                (<div className="query-batch">
                    <span> Thông kê doanh thu từ {queryByDate ? "ngày" : "đợt"} </span>
                    <input type={queryByDate ? 'string' : 'number'} value={queryByDate ? fromDateBatch : fromBatch} onChange={handleFromChange}/>
                    <span> đến {queryByDate ? "ngày" : "đợt"} </span>
                    <input type={queryByDate ? 'string' : 'number'} value={queryByDate ? toDateBatch : toBatch} onChange={handleToChange}/>
                    <button className='query-btn' onClick={handleGetBatches}> Tìm kiếm </button>
                    <button className='query-type-btn' onClick={handleChangeQueryType}> Đổi chế độ tìm kiếm </button>
                </div>)
                :
                (<div className="query-batch"> 
                    <span> Bảng thống kê doanh thu đợt {batchNumber + 1}</span>
                </div>)
            }
            { showTable ? 
                (<table className="report-table">
                    <thead>
                        <tr>
                            <th>Nhà phân phối</th>
                            <th>Nhóm</th>
                            <th>Cấp bậc</th>
                            <th>Cấp trên</th>
                            <th>Cấp dưới 1</th>
                            <th>Cấp dưới 2</th>
                            <th>Doanh thu</th>
                            <th>Hoa hồng từ doanh thu</th>
                            <th>Hoa hồng từ cấp dưới</th>
                            <th>Tổng số</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map(item => (
                            <tr key={item.sale._id}>
                                <td>{item.distributor.name}</td>
                                <td>{item.distributor.groupNo}</td>
                                <td>{item.distributor.level}</td>
                                <td>{item.distributor.parentName}</td>
                                <td>{item.distributor.children.length > 0 ? item.distributor.children[0].childrenName : ''}</td>
                                <td>{item.distributor.children.length > 1 ? item.distributor.children[1].childrenName : ''}</td>
                                <td>{editId === item.sale._id ? (<input type='number' value={editRevenue} onChange={handleRevenueChange} />) : item.sale.revenue}</td>
                                <td>{item.sale.commissionFromRevenue}</td>
                                <td>{item.sale.commissionFromChildren}</td>
                                <td className="total-income">{item.sale.totalIncome}</td>
                                <td>
                                    {editId === item.sale._id ? (
                                        <button className='save-sale-btn' onClick={handleUpdate}>Lưu</button>
                                    ) : (
                                        <button className='edit-sale-btn' onClick={() => handleBeforeUpdate(item.sale._id, item.sale.revenue)}>Chỉnh sửa</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>)
                :
                (<table className="statistic-table">
                    <thead>
                        <tr>
                            <th>Đợt</th>
                            <th>Ngày tạo</th>
                            <th>Nhà phân phối</th>
                            <th>Nhóm</th>
                            <th>Cấp bậc</th>
                            <th>Cấp trên</th>
                            <th>Cấp dưới 1</th>
                            <th>Cấp dưới 2</th>
                            <th>Doanh thu</th>
                            <th>Hoa hồng từ doanh thu</th>
                            <th>Hoa hồng từ cấp dưới</th>
                            <th>Tổng số</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statistic.map(batch => {
                            const rowSpan = batch.saleList.length; // Số hàng trong mỗi batch
                            return (
                            <React.Fragment key={batch._id}>
                                {batch.saleList.map((item, index) => (
                                <tr key={item._id}>
                                    {/* Chỉ render <td> của cột "Đợt" ở hàng đầu tiên */}
                                    {index === 0 && (
                                    <td rowSpan={rowSpan}>{batch.batchNumber}</td>
                                    )}
                                    {index === 0 && (
                                    <td rowSpan={rowSpan}>{new Date(batch.createdAt).toISOString().split('T')[0]}</td>
                                    )}
                                    <td>{item.distributorName}</td>
                                    <td>{item.groupNo}</td>
                                    <td>{item.level}</td>
                                    <td>{item.parentName}</td>
                                    <td>{item.children.length > 0 ? item.children[0].childrenName : ''}</td>
                                    <td>{item.children.length > 1 ? item.children[1].childrenName : ''}</td>
                                    <td>{item.revenue}</td>
                                    <td>{item.commissionFromRevenue}</td>
                                    <td>{item.commissionFromChildren}</td>
                                    <td className="total-income">{item.totalIncome}</td>
                                </tr>
                                ))}
                                <tr>
                                    <td colSpan="12" className='total-batch'>Tổng doanh thu trong đợt {batch.batchNumber} của tất cả nhà phân phối = {batch.totalInBatch}</td>
                                </tr>
                            </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>)
            } 
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}

export default BatchPage;
