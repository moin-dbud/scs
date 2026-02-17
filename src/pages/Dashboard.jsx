import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, User, LogOut, Settings, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    // Course data
    const courses = [
        {
            id: 'ai-cohort-2',
            title: "2.0 Job Ready AI Powered Cohort",
            enrolledDate: "Bought on August 20, 2025",
            progress: 1.97,
            image: "https://ik.imagekit.io/sheryians/Cohort%202.0/cohort-3_ekZjBiRzc-2_76HU4-Mz5z.jpeg?updatedAt=1757741949621",
            linkedDiscord: true
        },
        {
            id: 'fullstack-dev',
            title: "Full Stack Web Development",
            enrolledDate: "Bought on Sep 1, 2025",
            progress: 25.5,
            image: "https://ik.imagekit.io/sheryians/Cohort%202.0/cohort-3_ekZjBiRzc-2_76HU4-Mz5z.jpeg?updatedAt=1757741949621",
            linkedDiscord: true
        },
        {
            id: 'react-mastery',
            title: "React Development Mastery",
            enrolledDate: "Bought on Oct 15, 2025",
            progress: 45.8,
            image: "https://ik.imagekit.io/sheryians/Cohort%202.0/cohort-3_ekZjBiRzc-2_76HU4-Mz5z.jpeg?updatedAt=1757741949621",
            linkedDiscord: false
        }
    ];

    // Generate heatmap data (52 weeks × 7 days = 364 days)
    const generateHeatmap = () => {
        const days = [];
        for (let i = 0; i < 140; i++) {
            days.push({
                id: i,
                intensity: Math.floor(Math.random() * 5) // 0-4 intensity levels
            });
        }
        return days;
    };

    const heatmapData = generateHeatmap();

    const getHeatmapColor = (intensity) => {
        const colors = {
            0: 'bg-gray-800',
            1: 'bg-blue-900/40',
            2: 'bg-blue-700/60',
            3: 'bg-blue-600/80',
            4: 'bg-blue-500'
        };
        return colors[intensity] || colors[0];
    };

    // Dummy notifications
    const notifications = [
        {
            id: 1,
            type: 'success',
            message: 'You completed "React Hooks" lesson!',
            time: '2 hours ago',
            icon: '🎉'
        },
        {
            id: 2,
            type: 'info',
            message: 'New course material available',
            time: '5 hours ago',
            icon: '📚'
        },
        {
            id: 3,
            type: 'warning',
            message: 'Don\'t break your streak! Complete a task today',
            time: '1 day ago',
            icon: '⚡'
        }
    ];

    // Calculate overall stats
    const overallProgress = Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length);

    return (
        <div className="min-h-screen bg-black">
            {/* Top Navbar */}
            <nav className="bg-[#171717] border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-white"
                                style={{ fontFamily: 'outfit, outfit Fallback' }}>
                                LevelUp<span className="text-blue-500">.dev</span>
                            </h1>
                        </Link>

                        {/* Right Side - Notifications & Profile */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            {/* Profile Dropdown */}
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block text-right">
                                    <p className="text-xl font-bold text-white">Moin Sheikh</p>
                                </div>
                                <Link to="/profile">
                                    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-md cursor-pointer hover:scale-105 transition-transform">
                                        MS
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Welcome Section with Stats */}
            <div className="flex flex-col items-center justify-center max-w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 sm:pb-8">
                <div className="flex flex-col items-center justify-center">
                    <div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2"
                            style={{ fontFamily: 'outfit, outfit Fallback' }}>
                            Welcome aboard, <span className="text-blue-500">Moin Sheikh</span> 👋🏻
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base sm:w-[400px] sm:text-center sm:justify-center sm:mx-auto sm:px-4 sm:py-2">
                            Continue your learning journey where you left off
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content - 2 Column Layout */}
            <div className='relative flex flex-col bg-black py-7 px-5 gap-5 h-[calc(100vh-80px)] lg:flex-row bg-black'>
                <div className='bg-black rounded-2xl p-8 flex flex-col relative w-[40%] border border-white/[0.05] !p-0 min-h-[50%] max-lg:w-full h-full overflow-hidden relative w-full h-full !bg-[#171717] text-white/80 platform'>
                    <div className='text-2xl text-white flex justify-between bg-[#232323] p-4 px-8 items-center gap-2'>
                        <h1 style={{ fontFamily: 'outfit, outfit Fallback' }}>Classroom</h1>
                    </div>
                    <div className='flex px-5 md:px-7 sm:flex-row flex-col gap-3 justify-between md:items-center py-4 my-3'>
                        <h1 className='text-xl text-white '>Your enrolled courses</h1>
                    </div>
                    <div className='h-full overflow-hidden px-5 md:px-7'>
                        <div className='h-full overflow-y-auto space-y-4 pb-4'>
                            {courses.map((course) => (
                                <div key={course.id} className='bg-[#232323] rounded-lg overflow-hidden hover:bg-[#2a2a2a] transition-all duration-300'>
                                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4'>
                                        {/* Course Image */}
                                        <div className='flex-shrink-0 w-full sm:w-40 md:w-48 h-32 sm:h-24 md:h-28 rounded-lg overflow-hidden bg-gray-800'>
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className='w-full h-full object-cover'
                                            />
                                        </div>

                                        {/* Course Info */}
                                        <div className='flex-1 min-w-0 w-full sm:w-auto'>
                                            <h3 className='text-base sm:text-lg md:text-xl font-semibold text-white mb-1'>
                                                {course.title}
                                            </h3>
                                            <p className='text-xs sm:text-sm text-gray-400 mb-3'>
                                                {course.enrolledDate}
                                            </p>

                                            {/* Progress Bar */}
                                            <div className='mb-2'>
                                                <div className='flex items-center justify-between mb-1'>
                                                    <span className='text-xs text-gray-400'>Progress {course.progress}%</span>
                                                </div>
                                                <div className='w-full bg-gray-700 rounded-full h-1.5 overflow-hidden'>
                                                    <div
                                                        className='bg-[#3C83F6] h-full transition-all duration-500'
                                                        style={{ width: `${course.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className='flex flex-row sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto'>
                                            <Link to={`/course/${course.id}`} className='flex-1 sm:flex-none'>
                                                <button className='w-full bg-[#3C83F6] hover:bg-[#3C83F6]/80 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 whitespace-nowrap'>
                                                    Resume Learning
                                                </button>
                                            </Link>
                                            {course.linkedDiscord && (
                                                <button className='flex-1 sm:flex-none bg-[#2a2a2a] hover:bg-[#333] text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 whitespace-nowrap border border-gray-700'>
                                                    Linked with Discord
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='w-[35%]  max-lg:h-[45%] hidden sm:flex lg:flex-col gap-5 max-lg:w-full'>
                    {/* All Notifications */}
                    <div className='bg-black rounded-2xl p-8 flex flex-col relative w-[40%] border border-white/[0.05] !p-0 flex-1 w-full justify-between overflow-hidden relative w-full h-full !bg-[#171717] text-white/80 platform'>
                        <div className="flex items-center *: gap-2 pe-12 w-full shadow-md shadow-black/5 h-16 shrink-0 px-6 text-xl  text-white/80  bg-[#232323] text-2xl px-8 mb-3 border-white/10">All Notifications</div>
                        <div className="flex flex-col gap-8 p-4 px-8 h-full w-full overflow-y-auto custom-scrollbar"><div className="w-full h-full flex flex-col items-center justify-center text-center"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" className="text-grey-700 mb-4"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg><p className="text-lg text-grey-600 font-apfel">No notifications available</p><p className="text-sm text-grey-700 mt-2">You're all caught up! Check back later for updates.</p></div></div>
                    </div>

                    {/* Progress Heatmap */}
                    <div className='bg-black rounded-2xl p-8 flex flex-col relative w-[40%] border border-white/[0.05] !p-0 max-md:hidden flex-1 relative w-full h-full !bg-[#171717] text-white/80 platform'>
                        <div className="p-5 h-full w-full  justify-between flex-col">
                            <div className="flex justify-between">
                                <h1 className="text-2xl mb-3 px-1 tracking">Progress Heatmap</h1>
                            </div>
                            <div className="flex flex-col text-white w-full h-full">
                                <div className="mb-3 px-1 font-apfel text-primary text-lg flex items-center justify-between">Crushed 49 activities so far!</div>
                                <div className="grid gap-1 w-full select-none border p-3 rounded-lg border-white/20" style={{ gridTemplateRows: 'repeat(7, minmax(0px, 1fr))', gridTemplateColumns: 'repeat(20, minmax(0px, 1fr))' }}>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#3C83F6]" data-tip="20 activities on February 7, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#3C83F6]" data-tip="19 activities on February 14, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#2a2a2a]" data-tip="0 activities on February 8, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#2a2a2a]" data-tip="0 activities on February 15, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#2a2a2a]" data-tip="0 activities on February 9, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#8FB8FA]" data-tip="9 activities on February 16, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#2a2a2a]" data-tip="0 activities on February 10, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#8FB8FA]" data-tip="1 activity on February 17, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#2a2a2a]" data-tip="0 activities on February 11, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div class="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div class="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#2a2a2a]" data-tip="0 activities on February 12, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square transition-colors duration-300 bg-[#2a2a2a]" data-tip="0 activities on February 13, 2026"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                    <div className="relative rounded-sm w-full aspect-square bg-[#757575] transition-colors duration-300"></div>
                                </div>
                                <div class="mt-4 text-gray-400 flex items-start justify-between gap-5 px-1"><div>Learn how we count activities</div>
                                    <div className="flex gap-3">Less<div className="flex gap-1.5"><div className="relative rounded-md w-6 aspect-square bg-[#2a2a2a]"></div><div className="relative rounded-md w-6 aspect-square bg-[#BBD4FC]"></div><div className="relative rounded-md w-6 aspect-square bg-[#8FB8FA]"></div><div className="relative rounded-md w-6 aspect-square bg-[#639CF8]"></div><div className="relative rounded-md w-6 aspect-square bg-[#0B64F4]"></div></div>More</div></div></div></div></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


{/* <div className="max-w-full mx-auto px-4 sm:px-6 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    Left Section - Courses Panel (70%)
                    <div className="lg:col-span-9">
                        <div className="bg-[#171717] rounded-2xl p-4 sm:p-6 shadow-xl ">
                            Header with Search
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <h3 className="text-xl sm:text-2xl font-bold text-white"
                                    style={{ fontFamily: 'outfit, outfit Fallback' }}>
                                    My Courses
                                </h3>

                                Search Input
                                <div className="relative w-full sm:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                            </div>

                            Course Cards
                            <div className="space-y-4">
                                {filteredCourses.length > 0 ? (
                                    filteredCourses.map((course) => (
                                        <Link
                                            key={course.id}
                                            to={`/course/${course.id}`}
                                            className="block"
                                        >
                                            <div className="bg-black rounded-xl p-4 sm:p-5 border border-gray-800 hover:border-gray-700 transition-all duration-300 group cursor-pointer">
                                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                                                    Course Image
                                                    <div className="flex-shrink-0">
                                                        <div className="w-full sm:w-32 h-32 sm:h-24 rounded-lg overflow-hidden bg-gray-800 relative group-hover:scale-105 transition-transform">
                                                            <img
                                                                src={course.image}
                                                                alt={course.title}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80"%3E%3Crect fill="%233b82f6" width="120" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14" font-family="Arial"%3ECourse%3C/text%3E%3C/svg%3E';
                                                                }}
                                                            />
                                                            <div className={`absolute inset-0 bg-gradient-to-br ${course.gradient} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                                                        </div>
                                                    </div>

                                                    Course Info
                                                    <div className="flex-1">
                                                        <h4 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                                            {course.title}
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-gray-500 mb-3">
                                                            {course.enrolledDate} • {course.completed}/{course.lessons} lessons
                                                        </p>

                                                        Progress
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                                                <span className="text-gray-400">Progress</span>
                                                                <span className="text-blue-400 font-semibold">
                                                                    {course.progress}%
                                                                </span>
                                                            </div>

                                                            Progress Bar
                                                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className={`bg-gradient-to-r ${course.gradient} h-full rounded-full transition-all duration-500`}
                                                                    style={{ width: `${course.progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-400">No courses found matching "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    Right Section - Notifications & Heatmap (30%)
                    <div className="lg:col-span-3 space-y-6">

                            Notifications Panel
                        <div className="bg-[#1a1d24] rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg sm:text-xl font-bold text-white"
                                    style={{ fontFamily: 'outfit, outfit Fallback' }}>
                                    Notifications
                                </h3>
                                <span className="text-xs text-gray-500">{notifications.length} new</span>
                            </div>

                            Notifications List
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="bg-black rounded-lg p-3 sm:p-4 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                                    >
                                        <div className="flex gap-3">
                                            <span className="text-xl sm:text-2xl">{notification.icon}</span>
                                            <div className="flex-1">
                                                <p className="text-xs sm:text-sm text-white mb-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500">{notification.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            View All Button
                            <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                View all notifications →
                            </button>
                        </div>

                        Progress Heatmap Panel 
                        <div className="bg-[#1a1d24] rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg sm:text-xl font-bold text-white"
                                    style={{ fontFamily: 'outfit, outfit Fallback' }}>
                                    Activity
                                </h3>
                                <span className="text-xs text-gray-500">Last 365 days</span>
                            </div>

                            Heatmap Grid
                            <div className="overflow-x-auto">
                                <div className="inline-grid grid-cols-52 gap-[2px] sm:gap-[3px]">
                                    {heatmapData.map((day) => (
                                        <div
                                            key={day.id}
                                            className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-sm ${getHeatmapColor(day.intensity)} hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer`}
                                            title={`Day ${day.id + 1}`}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            Legend
                            <div className="flex items-center justify-end gap-2 mt-4">
                                <span className="text-xs text-gray-500">Less</span>
                                <div className="flex gap-1">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gray-800"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-900/40"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-700/60"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-600/80"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-500"></div>
                                </div>
                                <span className="text-xs text-gray-500">More</span>
                            </div>

                            Stats
                            <div className="mt-6 pt-4 border-t border-gray-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Current Streak</span>
                                    <span className="text-lg font-bold text-blue-500">🔥 12 days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}

















{/* Quick Stats */ }
{/* <div className="flex gap-3 sm:gap-4">
                        <div className="bg-[#1a1d24] rounded-xl p-3 sm:p-4 border border-gray-800">
                            <p className="text-xs sm:text-sm text-gray-400 mb-1">Overall Progress</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-500">{overallProgress}%</p>
                        </div>
                        <div className="bg-[#1a1d24] rounded-xl p-3 sm:p-4 border border-gray-800">
                            <p className="text-xs sm:text-sm text-gray-400 mb-1">Active Courses</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">{courses.length}</p>
                        </div>
                    </div> */}