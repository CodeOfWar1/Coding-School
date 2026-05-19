import { 
  FaFileAlt, 
  FaBook, 
  FaCheckCircle, 
  FaClock, 
  FaPlus, 
  FaCalendarAlt,
  FaGraduationCap,
  FaUserCheck,
  FaMoneyBillWave,
  FaHourglassHalf
} from 'react-icons/fa'

export default function StudentOverview({ profile, isStudent, studentRecord, applications, enrollments, courses, onCreateApplication }) {
  const activeApplication = applications?.find(a => a.status === 'pending' && a.progress !== 'completed')
  const completedApplication = applications?.find(a => a.status === 'approved' || a.progress === 'completed')
  const hasEnrollments = enrollments?.length > 0
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#faa853]/10 to-[#2d3f5d]/10 rounded-xl p-6 border border-[#faa853]/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#faa853]/20 flex items-center justify-center">
            <FaUserCheck className="text-[#faa853] text-xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#2d3f5d] mb-2">
              Welcome back, {profile?.first_name || 'Student'}!
            </h1>
            <p className="text-[#2d3f5d]/70">
              {isStudent 
                ? `You've been a student since ${new Date(studentRecord?.admitted_date).toLocaleDateString()}`
                : 'Complete your application to start your learning journey'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#faa853]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#faa853]/10 flex items-center justify-center">
              <FaFileAlt className="text-[#faa853] text-lg" />
            </div>
            <span className="text-2xl font-bold text-[#faa853]">{applications?.length || 0}</span>
          </div>
          <h3 className="font-semibold text-[#2d3f5d]">Applications</h3>
          <p className="text-sm text-gray-500 mt-1">Course applications submitted</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#faa853]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FaBook className="text-green-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-green-600">{enrollments?.length || 0}</span>
          </div>
          <h3 className="font-semibold text-[#2d3f5d]">Enrolled Courses</h3>
          <p className="text-sm text-gray-500 mt-1">Currently active courses</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#faa853]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaCheckCircle className="text-purple-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {applications?.filter(a => a.status === 'approved').length || 0}
            </span>
          </div>
          <h3 className="font-semibold text-[#2d3f5d]">Approved</h3>
          <p className="text-sm text-gray-500 mt-1">Completed applications</p>
        </div>
      </div>
      
      {/* Current Status - Application In Progress */}
      {activeApplication && !isStudent && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <FaHourglassHalf className="text-amber-600 text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Application In Progress</h3>
                <p className="text-amber-700">
                  Your application for <strong>{activeApplication.course?.course_name}</strong> is at: <strong>{activeApplication.progress?.replace('_', ' ')}</strong> stage
                </p>
              </div>
            </div>
            <button
              onClick={onCreateApplication}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              Continue Application
            </button>
          </div>
        </div>
      )}
      
      {/* Current Status - Application Completed / Awaiting Approval */}
      {completedApplication && !isStudent && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 mb-1">Application Complete!</h3>
              <p className="text-green-700">
                Your application for <strong>{completedApplication.course?.course_name}</strong> has been submitted!
                {completedApplication.status === 'awaiting_approval' && ' Awaiting admin approval.'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-[#2d3f5d] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {!isStudent && (
            <button
              onClick={onCreateApplication}
              className="px-5 py-2.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              New Application
            </button>
          )}
          {isStudent && hasEnrollments && (
            <button className="px-5 py-2.5 bg-gray-100 text-[#2d3f5d] rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <FaCalendarAlt className="text-sm" />
              View Schedule
            </button>
          )}
          {isStudent && (
            <button className="px-5 py-2.5 bg-gray-100 text-[#2d3f5d] rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <FaGraduationCap className="text-sm" />
              Browse Courses
            </button>
          )}
          {isStudent && hasEnrollments && (
            <button className="px-5 py-2.5 bg-gray-100 text-[#2d3f5d] rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <FaMoneyBillWave className="text-sm" />
              Payment History
            </button>
          )}
        </div>
      </div>
    </div>
  )
}